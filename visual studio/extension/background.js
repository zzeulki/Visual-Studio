var data_sources = ['screen', 'window'],
    desktopMediaRequestId = '';

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function (msg) {
    if (msg.type === 'SS_UI_REQUEST') {
      requestScreenSharing(port, msg);
    }

    if (msg.type === 'SS_UI_CANCEL') {
      cancelScreenSharing(msg);
    }
  });
});

function requestScreenSharing(port, msg) {
  // https://developer.chrome.com/extensions/desktopCapture
  // params:
  //  - 'data_sources' Set of sources that should be shown to the user.
  //  - 'targetTab' Tab for which the stream is created.
  //  - 'streamId' String that can be passed to getUserMedia() API
  var tab = port.sender.tab;
  tab.url = msg.url;
  desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(data_sources, tab, function(streamId) {
    if (streamId) {
      msg.type = 'SS_DIALOG_SUCCESS';
      msg.streamId = streamId;
    } else {
      msg.type = 'SS_DIALOG_CANCEL';
    }
    port.postMessage(msg);
  });
}

function cancelScreenSharing(msg) {
  // cancelChooseDesktopMedia crashes on the Mac
  // See: http://stackoverflow.com/q/23361743/980524
  if (desktopMediaRequestId) {
     chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
  }
}

// Avoiding a reload
chrome.windows.getAll({
  populate: true
}, function (windows) {
  var details = { file: 'js/content-script.js', allFrames: true },
      currentWindow;

  for (var i = 0; i < windows.length; i++ ) {
    currentWindow = windows[i];
    var currentTab;

    for (var j = 0; j < currentWindow.tabs.length; j++ ) {
      currentTab = currentWindow.tabs[j];
      // Skip chrome:// pages
      if (!currentTab.url.match(/(chrome):\/\//gi)) {
        // https://developer.chrome.com/extensions/tabs#method-executeScript
        chrome.tabs.executeScript(currentTab.id, details, function() {
          console.log('Injected content-script.');
        });
      }
    }
  }
});
