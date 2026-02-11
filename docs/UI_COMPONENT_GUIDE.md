# UI Component Guide

`src/shared/ui` に配置されている再利用可能なUIコンポーネントの使用ガイドです。
これらは Feature-Sliced Design に基づき、全ての Feature および Entity から使用することができます。

## FormattedDate

日本時間 (JST) で日付をフォーマットして表示するコンポーネント。ハイドレーションエラーを防ぐための処理が含まれています。

```tsx
import { FormattedDate } from '@/shared/ui/formatted-date';

/* Basic Usage */
<FormattedDate date={new Date()} />

/* With Options */
<FormattedDate
  date={new Date()}
  options={{
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }}
/>
```

## Button

汎用的なボタンコンポーネント。

```tsx
import { Button } from '@/shared/ui';

/* Variants */
<Button variant="primary">Primary (Default)</Button> {/* Uses bg-primary (Brand Blue) */}
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

/* With Size */
<Button size="icon">Icon Only</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

## Badge

ステータス、性別、カテゴリなどを表示するための小さなラベル。

```tsx
import { Badge } from '@/shared/ui';

/* Status Badge (colors based on keyword) */
<Badge label="ACTIVE" variant="status" />

/* Gender Badge */
<Badge label="牡" variant="gender" />

/* Origin Badge */
<Badge label="DOMESTIC" variant="origin" />

/* Condition Badge (Track Condition) */
<Badge label="良" variant="condition" />

/* Ranking Status with getDisplayStatus utility */
import { getDisplayStatus } from '@/shared/utils/race-status';

<Badge
  label={getDisplayStatus(race.status, hasRankings)}
  variant="status"
/>
```

## Dialog

モーダルダイアログ。`@radix-ui/react-dialog` をラップしています。

```tsx
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Use this for modal content.</DialogDescription>
    </DialogHeader>
    <div className="py-4">Content goes here...</div>
  </DialogContent>
</Dialog>;
```

## Form Elements

フォームで使用する基本的なコンポーネント。`react-hook-form` 等の `ref` 転送に対応しています。

```tsx
import { Input, Textarea, Select, Label } from '@/shared/ui';

<form>
  <div className="mb-4">
    <Label htmlFor="name">Name</Label>
    <Input id="name" placeholder="Enter name" />
  </div>

  <div className="mb-4">
    <Label>Description</Label>
    <Textarea rows={4} />
  </div>

  <div>
    <Label>Category</Label>
    <Select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </Select>
  </div>
</form>;
```

## Card

コンテンツをグループ化するコンテナ。

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content...</CardContent>
</Card>;
```
