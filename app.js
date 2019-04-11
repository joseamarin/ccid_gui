(function () {
  'use strict';

  const anchors = document.querySelectorAll('a');

  // stop links from going anywhere
  const pause = anchors => anchors.forEach(a => a.onclick = () => false);

  const links = Array.from(anchors).filter(cur => {
    return cur.href.includes('ccID');
  });

  const url = links[0].protocol + '//' + decodeURIComponent(links[0].hostname)
    .toUpperCase() + links[0].pathname + links[0].search.replace(/\&/g, '&amp;');

  const insertId = anchors => {
    anchors.forEach(anchor => {
      if (anchor.href.includes('ccID')) {
        anchor.addEventListener('click', e => {
          let input = prompt('Enter the ccID');
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
    btn.classList.add('js-btn');
    const anchor = document.createElement('a');
    anchor.innerText = 'Download';
    anchor.setAttribute('download', getFileName());

    btn.appendChild(anchor);
    document.documentElement.insertBefore(btn, document.body);
  }

  const dl = data => {

    const anchor = document.querySelector('.js-btn > a');
    anchor.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(data));
    /Gecko\/+\d*/.test(navigator.userAgent) ? anchor.click() : null;
  };

  pause(anchors);
  downloadBtn();
  insertId(anchors);

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
    const html = document.documentElement.outerHTML;
    const fullDocument = doctype !== undefined ? doctype + '\n' + html : html;
    const regex = new RegExp(paramsRegex, 'gim');

    let source = convertCharacters(fullDocument);
    source = source.replace(/<button class="js-btn">.*<\/button>/gi, '');
    source = source.replace(regex, endpoint);

    dl(source);
  }

  document.querySelector('.js-btn').addEventListener('click', e => {
    init();
  });
})();
