;(function() {
  const vscode = acquireVsCodeApi();

  let target = 'container';
  let transparentBackground = false;
  let backgroundColor = '#f2f2f2';
  let isInAnimation = false;


  const snippetNode = document.getElementById('snippet');
  const snippetContainerNode = document.getElementById('snippet-container');
  const obturateur = document.getElementById('save');

  snippetContainerNode.style.opacity = '1';
  const oldState = vscode.getState();
  if (oldState && oldState.innerHTML) {
    snippetNode.innerHTML = oldState.innerHTML;
  }

   /**
   * updates the snippet bg to value given
   * @param {color to use as snippet bg} snippetBgColor 
   */
  const updateSnippetBackground = (snippetBgColor) => {

    function getBrightness(hexColor) {
      const rgb = parseInt(hexColor.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // update snippet bg color
    snippetNode.style.backgroundColor = snippetBgColor;
    // update backdrop color
    if (getBrightness(snippetBgColor) < 128) 
    {
      snippetContainerNode.style.backgroundColor = '#f2f2f2';
    } 
    else 
    {
      snippetContainerNode.style.background = 'none';
    }
  };


  //The follwing are defining callbacks for events in the html
  window.addEventListener('message', e => {
    switch(e.data.type) {
      case 'init':
      {     
        /**
         * creates initial webview html for  snippet div
         * @param {font family in editor} fontFamily 
         * @returns 
         */
        const getInitialHtml = fontFamily => {
          const cameraWithFlashEmoji = String.fromCodePoint(128248);
          const monoFontStack = `${fontFamily},SFMono-Regular,Consolas,DejaVu Sans Mono,Ubuntu Mono,Liberation Mono,Menlo,Courier,monospace`;
          return `
            <meta charset="utf-8">
            <div style="
              color: #d8dee9;
              background-color: #2e3440; 
              font-family: ${monoFontStack};
              font-weight: normal;
              font-size: 12px;line-height: 18px;
              white-space: pre;">
              <div>
                <span style="color: #8fbcbb;">console</span>
                <span style="color: #eceff4;">.</span>
                <span style="color: #88c0d0;">log</span>
                <span style="color: #d8dee9;">(</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #a3be8c;">0. Run command \`Polacode ${cameraWithFlashEmoji}\`</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #d8dee9;">)</span>
              </div>
              <div>
                <span style="color: #8fbcbb;">console</span>
                <span style="color: #eceff4;">.</span>
                <span style="color: #88c0d0;">log</span>
                <span style="color: #d8dee9;">(</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #a3be8c;">1. Copy some code</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #d8dee9;">)</span>
              </div>
              <div><span style="color: #8fbcbb;">console</span>
                <span style="color: #eceff4;">.</span>
                <span style="color: #88c0d0;">log</span>
                <span style="color: #d8dee9;">(</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #a3be8c;">2. Paste into Polacode view</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #d8dee9;">)</span>
              </div>
              <div>
                <span style="color: #8fbcbb;">console</span>
                <span style="color: #eceff4;">.</span>
                <span style="color: #88c0d0;">log</span>
                <span style="color: #d8dee9;">(</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #a3be8c;">3. Click the button ${cameraWithFlashEmoji}</span>
                <span style="color: #eceff4;">'</span>
                <span style="color: #d8dee9;">)</span>
              </div>
            </div>
          </div>`;
        };
        const { fontFamily, bgColor } = e.data;
        const initialHtml = getInitialHtml(fontFamily);

        snippetNode.innerHTML = initialHtml;
        updateSnippetBackground(bgColor);
        vscode.setState({ innerHTML: initialHtml });
        break;
      }    
      
      case 'restore':
      {
        const { innerHTML, bgColor } = e.data;
        snippetNode.innerHTML = innerHTML;
        updateSnippetBackground(bgColor);        
        vscode.setState({ innerHTML });
        break;
      }
      
      case 'updateSettings': 
      {
        target = e.data.target;
        transparentBackground = e.data.transparentBackground;
        backgroundColor = e.data.backgroundColor;

        snippetContainerNode.style.backgroundColor = e.data.backgroundColor;
        snippetNode.style.boxShadow = e.data.shadow;
        snippetNode.style.fontVariantLigatures = (e.data.ligature) ? 'normal' : 'none';
        
        vscode.setState({ innerHTML: snippetNode.innerHTML });
        break;
      }
      
      case 'pasteFromSelection':
      {
        document.execCommand('paste');
      }

    }
  }); 

  document.addEventListener('paste', e => {

    function getMinIndent(code) {
      const arr = code.split('\n');
      let minIndentCount = Number.MAX_VALUE;
      for (let i = 0; i < arr.length; i++) {
        const wsCount = arr[i].search(/\S/);
        if (wsCount !== -1) {
          if (wsCount < minIndentCount) {
            minIndentCount = wsCount;
          }
        }
      }
      return minIndentCount;
    }
    function getSnippetBgColor(html) {
      const match = html.match(/background-color: (#[a-fA-F0-9]+)/);
      return match ? match[1] : undefined;
    }
    function stripInitialIndent(html, indent) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const initialSpans = doc.querySelectorAll('div > div span:first-child');
      for (let i = 0; i < initialSpans.length; i++) {
        initialSpans[i].textContent = initialSpans[i].textContent.slice(indent);
      }
      return doc.body.innerHTML;
    }

    const innerHTML = e.clipboardData.getData('text/html');
    const code = e.clipboardData.getData('text/plain');
    const minIndent = getMinIndent(code);
    const snippetBgColor = getSnippetBgColor(innerHTML);

    if (snippetBgColor) {
      vscode.postMessage({
        type: 'updateBgColor',
        data: {
          bgColor: snippetBgColor
        }
      });
      updateSnippetBackground(snippetBgColor);
    }

    snippetNode.innerHTML = (minIndent !== 0) ? stripInitialIndent(innerHTML, minIndent) : innerHTML;
    vscode.setState({ innerHTML });
  });

  obturateur.addEventListener('click', () => {
    
    function shoot() {

      function getRgba(hex, transparentBackground) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        const a = transparentBackground ? 0 : 1;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      function serializeBlob (blob) {
        const fileReader = new FileReader();
    
        fileReader.onload = () => {
          const bytes = new Uint8Array(fileReader.result);
          const serializedBlob = Array.from(bytes).join(',');
          vscode.postMessage({
            type: 'shoot',
            data: {
              serializedBlob
            }
          });
        };
    
        fileReader.readAsArrayBuffer(blob);
      };
  
      
      const width = snippetContainerNode.offsetWidth * 2;
      const height = snippetContainerNode.offsetHeight * 2;
  
      const config = (target === 'container') 
        ?
        {
          width,
          height,
          style: {
            transform: 'scale(2)',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'transform-origin': 'center',
            background: getRgba(backgroundColor, transparentBackground)
          }
        }
        : 
        {
          width,
          height,
          style: {
            transform: 'scale(2)',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'transform-origin': 'center',
            padding: 0,
            background: 'none'
          }
        };
      
  
      // Hide resizer before capture
      snippetNode.style.resize = 'none';
      snippetContainerNode.style.resize = 'none';
  
      domtoimage.toBlob(snippetContainerNode, config).then(blob => {
        snippetNode.style.resize = '';
        snippetContainerNode.style.resize = '';
        serializeBlob(blob);
      });
    }
      
    shoot();
  });

  obturateur.addEventListener('mouseover', () => {
    if (!isInAnimation) {
      isInAnimation = true;

      new Vivus(
        'save',
        {
          duration: 40,
          onReady: () => {
            obturateur.className = 'obturateur filling';
          }
        },
        () => {
          setTimeout(() => {
            isInAnimation = false;
            obturateur.className = 'obturateur';
          }, 700);
        }
      );
    }
  });


})();

