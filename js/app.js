/* globals alert prompt XMLSerializer */
(function () {
  'use strict';

  const anchors = document.querySelectorAll('a');
  const imgs = document.querySelectorAll('img');
  const links = document.querySelectorAll('link');
  const cName = 'x' + Math.random().toString(36).substring(2);
  const jsName = 'js-' + Math.random().toString(36).substring(2);
  const centerClass = 'x' + Math.random().toString(36).substring(2);

  const css = `
.${cName}{display:inline-block;border:3px solid currentColor;}
.${centerClass}{padding:10px;font-family:sans-serif;}
  `;

  const createRadio = () => {
    const html = `
Remove TBODY elements?
<input type="radio" id="removeTbody" name="tbody" value="true" checked>
<label for="true">Yes</label>
<input type="radio" id="leaveTbody" name="tbody" value="false">
<label for="false">No</label>
    `;
    const element = document.createElement('center');
    element.classList.add(centerClass);
    element.innerHTML = html;
    document.documentElement.insertBefore(element, document.body);
  };

  // add the style tag to the head
  const hlStyle = css => {
    const head = document.head;
    const style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
  };

  // stop links from going anywhere
  const pause = anchors => anchors.forEach(a => { a.onclick = () => false; });

  const hl = nodes => {
    nodes.forEach(node => {
      if (node.href.includes('ccID')) node.classList.add(cName);
    });
  };

  const insertId = anchors => {
    anchors.forEach(anchor => {
      if (anchor.href.includes('ccID')) {
        anchor.addEventListener('click', e => {
          let input = prompt('Enter the ccID', anchor.href
            .match(/ccID=*[0-9]*/gi)[0]
            .substring(anchor.href.match(/ccID=*[0-9]*/gi)[0].length, 5));
          if (input == null) {

          } else if (isNaN(input)) {
            alert('Invalid input');
          } else if (!input.trim()) {
            alert('Invalid input');
          } else {
            anchor.href = anchor.href.replace(/ccID=*[0-9]*/gi, 'ccID=');
            input = input.trim();
            anchor.href = anchor.protocol +
              '//' +
              decodeURIComponent(anchor.hostname).toUpperCase() +
              anchor.pathname + anchor.search + input;
          }
        });
      }
    });
  };

  const getFileName = () => {
    const url = window.location.pathname;
    const filename = url.substring(url.lastIndexOf('/') + 1);
    return filename;
  };

  const downloadBtn = () => {
    const center = document.createElement('center');
    const btn = document.createElement('button');
    const anchor = document.createElement('a');
    anchor.classList.add(jsName);
    center.classList.add(centerClass);
    btn.innerText = 'Download';
    anchor.setAttribute('download', getFileName());
    anchor.appendChild(btn);
    center.appendChild(anchor);
    document.documentElement.insertBefore(center, document.body);
  };

  pause(anchors);
  hlStyle(css);
  hl(anchors);
  insertId(anchors);
  createRadio();
  downloadBtn();

  const dl = data => {
    const anchor = document.querySelector(`.${jsName}`);
    anchor.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(data));
    if (/Gecko\/+\d*/.test(navigator.userAgent)) anchor.click();
    setTimeout(() => window.location.reload(), 1000);
  };

  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '&amp;');

  const patterns = [];
  const urls = [];

  const patternsAndReplacements = (anchors, imgs, links) => {
    anchors.forEach(anchor => {
      if (!anchor.href.includes('ccID') && anchor.href.includes('&')) {
        patterns.push(new RegExp(escape(anchor.href), 'g'));
        urls.push(anchor.href);
      }
    });
    links.forEach(link => {
      if (link.href.includes('&')) {
        patterns.push(new RegExp(escape(link.href), 'g'));
        urls.push(link.href);
      }
    });
    imgs.forEach(img => {
      if (img.src.includes('&')) {
        patterns.push(new RegExp(escape(img.src), 'g'));
        urls.push(img.src);
      }
    });
  };

  patternsAndReplacements(anchors, imgs, links);

  const paramify = (obj, amp = '&') => {
    return Object.keys(obj).map(key => {
      return key + '=' + obj[key];
    }).join(amp);
  };

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
          } else {
            url = paramify(paramObj, amp);
          }
        }
      });
    });
    return url;
  };

  const endpoint = checkParams(Object.keys(q), anchors, q, '&');
  const paramsRegex = checkParams(Object.keys(q), anchors, q, '&amp;');

  let doctype = '';
  if (document.doctype) {
    doctype = new XMLSerializer().serializeToString(document.doctype);
  }

  const convertCharacters = html => {
    let convertedHtml = '';
    let i = 0;
    while (i < html.length) {
      if (html.charCodeAt(i) > 127) {
        convertedHtml += '&#' + html.charCodeAt(i) + ';';
      } else {
        convertedHtml += html.charAt(i);
      }
      ++i;
    }
    return convertedHtml;
  };

  const init = () => {
    let containsTbody = false;
    if (document.getElementById('removeTbody').checked) {
      alert('TBODY HTML elements will be removed!');
      containsTbody = true;
    } else {
      alert('TBODY HTML elements will not be removed!');
    }

    document.querySelector('.' + centerClass).parentNode
      .removeChild(document.querySelector('.' + centerClass));

    anchors.forEach(a => a.classList.remove(cName));
    const html = document.documentElement.outerHTML;
    const fullDocument = doctype !== undefined ? doctype + '\n' + html : html;
    const regex = new RegExp(paramsRegex, 'gim');
    const cssRegex = new RegExp('<style>' + css + '</style>', 'gim');
    const jsNameRegex = new RegExp(`<a class="${jsName}">?.*</a>`, 'g');
    const radioRegex = new RegExp(`<center class="${centerClass}">?.*</center>`, 'g');

    let source = convertCharacters(fullDocument);
    if (containsTbody) {
      source = source.replace(/<tbody>|<\/tbody>/g, '');
    }
    patterns.forEach((pattern, idx) => {
      source = source.replace(pattern, urls[idx]);
    });
    source = source.replace(radioRegex, '');
    source = source.replace(regex, endpoint);
    source = source.replace(cssRegex, '');
    source = source.replace(jsNameRegex, '');
    source = source.replace(/class=""/g, '');

    dl(source);
  };

  document.querySelector('.' + jsName).addEventListener('click', e => {
    init();
  });
})();
