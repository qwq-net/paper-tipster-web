# オッズシステム仕様書

## 1. 概要

本システムにおけるオッズの計算、配信、表示の仕組みについて記述します。
Server-Sent Events (SSE) を利用したリアルタイム更新と、Redisを用いた高度な負荷対策（Leading & Trailing Edge Throttling）が特徴です。

## 2. オッズ計算ロジック

**ファイル**: `src/features/betting/logic/odds.ts`

- **トリガー**: `calculateOdds(raceId)` 関数が呼び出された時（主に投票確定時など）。
- **計算対象**:
  - 現在は `単勝 (WIN)` のみが計算対象です。
- **計算式**:
  1.  **総投票数 (Pool)**: そのレースの単勝投票総額を集計。
  2.  **個別オッズ**: 総投票数を各馬への投票額で割る（控除なし）。
      - `Odds = Pool / Vote Amount`
  3.  **端数処理**: 小数点第2位以下を切り捨て（例: 2.46 -> 2.4）。
  4.  **最低保証**: 1.1倍未満にはなりません（JRA準拠）。
  5.  **ゼロ除算対策**: 投票数が0の場合はオッズを `0.0` とします。

### 2.2 BET5 (5重勝単勝式)

**ファイル**: `src/features/betting/logic/bet5.ts`

- **計算方式**: キャリーオーバー方式（プール制）
- **オッズ**: 固定オッズではなく、的中者数による山分けとなります。
- **計算式**:
  1. **総ポット (Total Pot)**: `Initial Pot` + `Total Sales` (当回の売上) + `Event Carryover` (的中者なしレースの累計売上)
  2. **配当 (Dividend)**: `Total Pot / Winner Count` (小数点以下切り捨て)
  3. **特記事項**: 控除率は適用されず（0%）、総取り方式となります。的中者なしの場合はイベントの `carryoverAmount` に蓄積され、次回の払い戻しポットに加算されます。

### 2.3 最低保証オッズ (Guaranteed Odds)

各券種には、夢と堅実さのバランスを考慮した「最低保証オッズ（デフォルト値）」が設定されています。
これらは**システム全体のマスターデータ**として管理され、新規レース作成時の初期値として適用されます。
※ 作成済みのレースの保証オッズは、各レースの編集画面で個別に変更することが可能です。

**デフォルト保証オッズ設定値**

| キー               | 券種   | デフォルト倍率 | 解説・理由                                                                          |
| :----------------- | :----- | :------------- | :---------------------------------------------------------------------------------- |
| `win`              | 単勝   | **3.5 倍**     | 1番人気(2倍前後)より少し夢があり、中穴(5倍)には届かない絶妙なライン。               |
| `place`            | 複勝   | **1.5 倍**     | 堅実な投資として機能するライン。「元返し」を防ぐ最低限の保証。                      |
| `bracket_quinella` | 枠連   | **8.0 倍**     | ゾロ目や人気決着でもそこそこ美味しいと思える値。                                    |
| `quinella`         | 馬連   | **15.0 倍**    | 適当に買っても「15倍もらえるなら」と納得できるライン。                              |
| `wide`             | ワイド | **5.0 倍**     | 的中しやすい券種なので、これくらいがインフレを防ぎつつ魅力的。                      |
| `exacta`           | 馬単   | **30.0 倍**    | 着順指定の難易度に見合う、分かりやすい「30倍」というキリ番。                        |
| `trifecta`         | 3連単  | **200.0 倍**   | **重要**。夢の万馬券（100倍超え）を確約しつつ、大荒れ時のプール配当には負ける設定。 |
| `trio`             | 3連複  | **40.0 倍**    | 馬単より少し高く、当てやすさとのバランスが良い値。                                  |

## 3. データ保存と配信フロー

### データベース (PostgreSQL)

- **テーブル**: `race_odds`
- **保存内容**: 計算された `winOdds` (JSONB) と `placeOdds` (JSONB)、および `updatedAt` を保存。
- **更新**: `raceId` をキーに UPSERT (On Conflict Do Update) を行います。
- **計算頻度**: スロットリングに関わらず、**計算とDB保存はリクエスト毎に必ず実行**されます。

### Redis (Throttling)

- **目的**: 短期間に連続してイベント配信が行われるのを防ぎつつ、最終的な状態を確実に届けるため。
- **キー**:
  - `race:{raceId}:last_odds_notification`: 通知ロック（TTL 10秒）
  - `race:{raceId}:update_scheduled`: 遅延実行予約ロック
- **動作 (Leading & Trailing Edge)**:
  1.  **Leading Edge (即時実行)**:
      - `last_odds_notification` がない場合、即座にイベントを発行し、ロックをセットします。
  2.  **Trailing Edge (遅延実行)**:
      - ロック中にリクエストがあった場合、`update_scheduled` をチェック（Atomic SET NX）。
      - 未予約であれば、`setTimeout` でロック解除時刻に合わせて実行を予約します。
  3.  **Cool-down**:
      - Trailing Edge での実行直後に、再度 `last_odds_notification` ロックを10秒間セットします。
      - これにより、高負荷時でも「更新 -> 10秒待機 -> 更新 -> 10秒待機」というサイクルが保たれます。

### SSE (Server-Sent Events)

- **ファイル**: `src/app/api/events/race-status/route.ts`, `src/lib/sse/event-emitter.ts`
- **仕組み**: Node.js の `EventEmitter` (`raceEventEmitter`) をシングルトンとして利用。
- **ペイロード**: 計算済みのオッズデータを含みます。
  ```json
  {
    "type": "RACE_ODDS_UPDATED",
    "raceId": "...",
    "data": {
      "winOdds": {...},
      "placeOdds": {...},
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  }
  ```

## 4. クライアント側の挙動

**ファイル**: `src/features/race/hooks/use-race-odds.ts`, `src/features/betting/ui/bet-table.tsx`

- **接続**: `useRaceEvents` フックを通じて SSE エンドポイントに接続。
- **イベント受信**: `RACE_ODDS_UPDATED` イベントを受け取ると、`handleOddsUpdated` が発火。
- **データ更新**: イベントペイロード内の `data` を直接使用してステートを更新（**Fetchレス**）。
  - これにより "Thundering Herd" 問題（一斉アクセスによるサーバー負荷）を回避しています。
- **表示**:
  - オッズ値をテーブルに反映。
  - 「オッズ最終更新: HH:mm:ss」をテーブル上部に表示。
  - 更新時にトースト通知を表示。

## 5. まとめ図解

```mermaid
sequenceDiagram
    participant User as User/System
    participant Logic as calculateOdds
    participant Redis
    participant DB as PostgreSQL
    participant SSE as SSE Endpoint
    participant Client

    User->>Logic: 投票アクション
    Logic->>DB: 計算 & UPSERT

    Logic->>Redis: GET last_notification
    alt ロックなし (Leading Edge)
        Logic->>SSE: emit RACE_ODDS_UPDATED (Payloadあり)
        SSE-->>Client: data: { ...odds }
        Logic->>Redis: SET last_notification (TTL 10s)
    else ロックあり (Throttling)
        Logic->>Redis: SET update_scheduled NX
        alt 予約成功
            Logic->>Logic: setTimeout (残TTL秒後)
        end
    end

    Note over Logic: --- 10秒後 (Trailing Edge) ---
    Logic->>DB: 最新オッズ取得
    Logic->>SSE: emit RACE_ODDS_UPDATED (Payloadあり)
    SSE-->>Client: data: { ...odds }
    Logic->>Redis: SET last_notification (TTL 10s) <Cool-down>
```
