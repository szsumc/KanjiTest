// 当用户访问 URL 时显示页面
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('漢字テスト');
}

// 漢字集シートから全データを取得
function getKanjiData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('漢字集'); // シート名を「漢字集」に指定
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    return data; // 1行目がヘッダーなら .slice(1) を使う
  } catch (e) {
    return null;
  }
}

// 難問リストシートから全データを取得
function getHardKanjiData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('難問リスト'); // シート名を「難問リスト」に指定
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    return data; // 1行目がヘッダーなら .slice(1) を使う
  } catch (e) {
    return null;
  }
}

// 行番号を検索して、正解または不正解のカウントを更新する
function updateCount(num, isCorrect) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('漢字集');
  var data = sheet.getDataRange().getValues();
  
  // A列(インデックス0)から番号を探す
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == num) {
      // H列(インデックス7)は正解、I列(インデックス8)は不正解
      var colIndex = isCorrect ? 7 : 8;
      var currentValue = sheet.getRange(i + 1, colIndex + 1).getValue();
      sheet.getRange(i + 1, colIndex + 1).setValue((currentValue || 0) + 1);
      return true;
    }
  }
  return false;
}

// 指定された番号の正解数・不正解数を取得する
function getScore(num) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('漢字集');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == num) {
      // H列(index 7): 正解数, I列(index 8): 不正解数
      return {
        correct: data[i][7] || 0,
        incorrect: data[i][8] || 0
      };
    }
  }
  return { correct: 0, incorrect: 0 };
}
