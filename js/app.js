(function () {
  'use strict';

  const anchors = document.querySelectorAll('a');
  const cName = 'x' + Math.random().toString(36).substring(2);
  const jsName = 'js-' + Math.random().toString(36).substring(2);

  const css = `
.${cName}{display:inline-block!important;border:3px solid currentColor!important;}
  `;

  // add the style tag to the head
  const hlStyle = css => {
    const head = document.head;
    const style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
  }

  // stop links from going anywhere
  const pause = anchors => anchors.forEach(a => a.onclick = () => false);

  const hl = nodes => {
    nodes.forEach(node => {
      node.href.includes('ccID') ? node.classList.add(cName) : null;
    });
  }

  const insertId = anchors => {
    anchors.forEach(anchor => {
      if (anchor.href.includes('ccID')) {
        anchor.addEventListener('click', e => {
          let input = prompt('Enter the ccID', anchor.href
            .match(/ccID=*[0-9]*/gi)[0]
            .substring(anchor.href.match(/ccID=*[0-9]*/gi)[0].length, 5));
          if (input == null) {
            return;
          }
          else if (isNaN(input)) {
            alert('Invalid input');
          }
          else if (!input.trim()) {
            alert('Invalid input');
          }
          else {
            anchor.href = anchor.href.replace(/ccID=*[0-9]*/gi, 'ccID=');
            input = input.trim();
            anchor.href = anchor.protocol
              + '//'
              + decodeURIComponent(anchor.hostname).toUpperCase()
              + anchor.pathname + anchor.search + input;
          }
        });
      }
    });
  }

  const getFileName = () => {
    const url = window.location.pathname;
    const filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
  }

  const downloadBtn = () => {
    const btn = document.createElement('button');
    const anchor = document.createElement('a');
    anchor.classList.add(jsName);
    btn.innerText = 'Download';
    anchor.setAttribute('download', getFileName());
    anchor.appendChild(btn);
    document.documentElement.insertBefore(anchor, document.body);
  }

  pause(anchors);
  hlStyle(css);
  hl(anchors);
  insertId(anchors);
  downloadBtn();

  const dl = data => {
    const anchor = document.querySelector(`.${jsName}`);
    anchor.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(data));
    /Gecko\/+\d*/.test(navigator.userAgent) ? anchor.click() : null;
  };

  const paramify = (obj, amp = '&') => {
    return Object.keys(obj).map(key => {
      return key + '=' + obj[key];
    }).join(amp);
  }

  const q = {
    eid: '{{EMAIL_USER_ID}}',
    cid: '{{CID}}',
    em: '{{EMAIL_ADDR}}',
    id: '{{LINK_ID}}',
    n: '{{NID}}',
    f: '{{F}}',
    s: '{{S}}',
    c: '{{CRID}}',
    cwprogid: '{{CWPROGID}}',
    did: '{{MID}}',
    binding: '{{BINDING}}',
    tid: '{{TID}}',
    headerid: '{{HEADER}}',
    footerid: '{{FOOTER}}',
    ctype: 'R',
    ccID: ''
  };

  const checkParams = (keys, anchors, paramObj, amp) => {
    let url;
    keys.forEach(key => {
      let regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
      Array.from(anchors).forEach(a => {
        if (a.href.includes('ccID')) {
          if (a.href.match(regex)[1] === '') {
            paramObj[key] = '';
            url = paramify(paramObj, amp);
          }
          else {
            url = paramify(paramObj, amp);
          }
        }
      });
    });
    return url;
  }

  const endpoint = checkParams(Object.keys(q), anchors, q, '&');
  const paramsRegex = checkParams(Object.keys(q), anchors, q, '&amp;');

  let doctype = '';
  if (document.doctype) {
    doctype = new XMLSerializer().serializeToString(document.doctype);
  }

  const convertCharacters = html => {
    let converted_html = '';
    let i = 0;
    while(i < html.length) {
      if (html.charCodeAt(i) > 127) {
        converted_html += '&#' + html.charCodeAt(i) + ';';
      }
      else {
        converted_html += html.charAt(i);
      }
      ++i;
    }
    return converted_html;
  }

  const init = () => {
    anchors.forEach(a => a.classList.remove(cName));
    const html = document.documentElement.outerHTML;
    const fullDocument = doctype !== undefined ? doctype + '\n' + html : html;

    const regex = new RegExp(paramsRegex, 'gim');
    const cssRegex = new RegExp('<style>' + css + '</style>', 'gim');
    const jsNameRegex = new RegExp(`<a class="${jsName}">?.*</a>`, 'g');

    let source = convertCharacters(fullDocument);
    source = source.replace(regex, endpoint);
    source = source.replace(cssRegex, '');
    source = source.replace(jsNameRegex, '');
    source = source.replace(/class=""/gi, '');
    source = source.replace(/<script src="https:\/\/rawcdn.githack.com\/>?.*<\/script>/gmi, '');

    dl(source);
  }

  document.querySelector('.' + jsName).addEventListener('click', e => {
    init();
  });
})();
