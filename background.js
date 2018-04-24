function get(name) {
	let val = localStorage.getItem(name);
	if (!val || val == 'false') {
		return false;
	}
	return val;
}

function set(name,val) {
	localStorage.setItem(name,val);
}

function startSpeak(text) {
	return new Promise(function(resolve, reject) {
		let vc = get('voice');
		let request = {
			url: "https://enkhsanaa.me/tts/",
			data: { txt: text, voice: vc }
		};
		$.ajax({
			type : 'POST',
			url : request.url,
			data : JSON.stringify(request.data),
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Authorization', "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTEyMjI4MDEzfQ.azn06Ee5KB617sSyXC02Z-FAwixlVjavVAdlgBgaRbc");
				xhr.setRequestHeader("Content-Type", "application/json");
			},
			success: function(resp) {
				let audio_src = request.url + resp.fileName;

				console.log(audio_src);

				if (window.current_audio === null) { // Өмнө audio элэмэнт үүсээгүй байвал шинээр үүсгэнэ
					window.current_audio = new Audio();
				}
				window.current_audio.src = audio_src;
				window.current_audio.load();
				window.current_audio.play();
				window.current_audio.onerror = reject;
				window.current_audio.onended = resolve;
			},
			error: function(err) {
				window.alert(JSON.stringify(err));
			}
		});
	});
}

function isFalseyOrWhiteSpace(str) {
	return (!str || str.length === 0 || /^\s*$/.test(str))
}

function getLeafNodes(master) {
	var nodes = Array.prototype.slice.call(master.getElementsByTagName("*"), 0); // энэ бүх node ийг нь салгаж авах
	var leafNodes = nodes.filter(function(elem) {
		console.log(elem.tagName);
		if (elem.tagName == 'SCRIPT' || elem.tagName == 'STYLE') {
			return false;
		}
		let tidyText = (elem.textContent).replace(/[^а-яА-ЯӨөҮүёЁ0-9]+/g," ");
		if (isFalseyOrWhiteSpace(tidyText)) {
			return false;
		}
		if (elem.tagName == 'P') {
			return true;
		}
		if (elem.hasChildNodes()) {
			for (var i = 0; i < elem.childNodes.length; i++) {
				if (elem.childNodes[i].nodeType == 1) {
					return false;
				}
			}
		}
		return true;
	});
	return leafNodes;

}

function getContent(pageURL) {

	let xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			let parser = new DOMParser();
			let xmlDoc = parser.parseFromString(xhr.responseText,"text/html");

			window.current_audio = null;

			let leaves = getLeafNodes(xmlDoc.body);
			let current_leaf = 0; // хамгийн анх 0 индекстэй leaf-ийг унших гэж оролдоно

			let readLeaf = (leaf) => { // Leaf-ийн текстийг уншдаг функц

				if(current_leaf > leaves.length) return;
				let tname = leaf.tagName;
				let tcontent = leaf.textContent;
				console.log(tcontent);
				let tidyText = (tcontent).replace(/[^а-яА-ЯӨөҮүёЁ0-9]+/g," ");


				if (tname == 'IMG') tidyText = 'зураг'; // Зураг байвал унших текст "зураг" болно

				startSpeak(tidyText).then(ret => { // амжилттай уншсан
					current_leaf++; // Унших leaf-г дараагийн индекс дээр тохируулна
					readLeaf(leaves[current_leaf]);
				}).catch(err => {
					/*
					* уншиж чадаагүй бол юу ч хийхгүй зүгээр яг юу болсоныг хэвлээд л орхи.
					* Тэгээд fail-дсэн шалтгаанаа дараа нь уншаад яаж тийм зүйл болгохгүй байх вэ
					* гэж бодоод дээрээ засвар оруул.
					*/
					console.log(err);
				});
			};

			readLeaf(leaves[current_leaf]); // Эхнийхийг унш
		}
	}

	xhr.open("GET",pageURL,true);
	xhr.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	window.alert(window.getSelection().toString());
	if (request.method == "getSelection") {
		chrome.tabs.executeScript( {
			code: "window.getSelection().toString();"
		}, function(selection) {
			sendResponse({data: selection});
		});
	}
});

function selectionContextMenu() {
	chrome.contextMenus.removeAll(function() {});
	chrome.contextMenus.create({
		'type':'normal',
		'title':'Уншаад өг',
		'contexts':['selection'],
		'onclick': function(info) {
			window.current_audio = null;
			startSpeak(info.selectionText);
		} 
	});
}

$(document).ready(function() {

	selectionContextMenu();

});

//GA
(function(i,s,o,g,r,a,m) {i['GoogleAnalyticsObject']=r;i[r]=i[r]||function() {
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-00000000-0', 'auto');
ga('send', 'pageview');