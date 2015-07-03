# csv2geojson-api

csv2geojson API for conveting OpenData

# What is this?

位置情報を含むCSVデータをgetjsonに変換し、指定したGitHubリポジトリにコミットする REST APIです。
主に公共機関が公開しているCSVをgeojsonに変換する処理の自動化を容易にすることを想定して開発されました。

GitHubにgeojsonをホストする理由は、[geojsonがMapboxで可視化されるから](https://www.mapbox.com/blog/github-mapbox-maps/)です。

# Setup

```
$ npm install -g swagger-node
$ git clone
$ cd 
$ npm install
$ swagger project edit
```

Open other terminal window

```
$ GITHUB_USERNAME=[your github username] GITHUB_PASSWORD=[your github password] swagger project start
```

# API spec

単にCSVをgeojsonに変換してレスポンスする `/convert` と  
CSVをgeojsonに変換して指定したリポジトリにcommitする `/convert/github/push/{repo}` があります。

API仕様の詳細は [Swagger Editor](http://editor.swagger.io/#/) に [./api/swagger/swagger.yaml](https://raw.githubusercontent.com/bathtimefish/csv2geojson-api/master/api/swagger/swagger.yaml) を読み込んで確認してください。

# LICENSE

MIT

# TODO

* エラーチェックほとんどしてないのでそのうちやる
* PR版をつくろうかどうしようか
* GitHubアカウント、パスワードの持ち方を変えるかもしれないやらないかもしれない
