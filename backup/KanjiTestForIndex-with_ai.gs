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

function analyzeHandwriting(imageData, correctKanji) {

  const apiKey = 'AIzaSyDgM2KxlcKVqvDm8EAtv4x__OYuIXeS_Tg';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません。スクリプトプロパティに設定してください。');
  }
  
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
  const payload = {
    contents: [{
      parts: [
        { text: "この画像に書かれた漢字を1文字だけ答えてください。余計な説明は不要です。" },
        { inline_data: { mime_type: "image/png", data: imageData } }
      ]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    const recognizedText = data.candidates[0].content.parts[0].text.trim();
    
    if (recognizedText === correctKanji) {
      return { status: '正解', comment: '認識: ' + recognizedText };
    } else {
      return { status: '不正解', comment: '認識: ' + recognizedText + ' (正解: ' + correctKanji + ')' };
    }
  } catch (error) {
    throw new Error('AI判定に失敗しました: ' + error.message);
  }
}