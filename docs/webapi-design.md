# API 設計メモ

## 対戦を開始する

「対戦を登録する」

POST /api/games

## 現在の盤面を表示する

指定したターン数のターンを取得する api

GET /api/games/latest/turns/{turnCount}

レスポンスボディ

```json
{
  "turnCount": 1,
  "board": [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  "nextDisc": 1,
  "winnerDisc": 1
}
```

## 石を打つ

「ターン」を登録する

POST /api/games/latest/turns

リクエストボディー

```json
{
  "turnCount": 1,
  "move": {
    "disc": 1,
    "x": 0,
    "y": 0
  }
}
```

## 「自分の過去の対戦結果を確認する」ユースケース

「対戦」の一覧を取得する

GET /api/games

レスポンスボディ

```json
{
  "games": [
    {
      "id": 1,
      "winnerDisc": 1,
      "startedAt": "YYYY-mm-dd HH:ii:ss"
    }
  ]
}
```

##### 補足

※リバーシでは駒を disc または disk という。
※リバーシでは手を打つことを move という。
