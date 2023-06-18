// global variables;
const doc = document.documentElement;
const toggleId = 'toggle';
const showId = 'show';
const menu = 'menu';
const active = 'active';
const rootURL = window.location.protocol + "//" + window.location.host;
const searchFieldClass = '.search_field';
const searchClass = '.search';

// defined in i18n / translation files
const quickLinks = '{{ T "quick_links" }}';
const searchResultsLabel = '{{ T "search_results_label" }}';
const shortSearchQuery = '{{ T "short_search_query" }}'
const typeToSearch = '{{ T "type_to_search" }}';
const noMatchesFound = '{{ T "no_matches" }}';


function isObj(obj) {
  return (obj && typeof obj === 'object' && obj !== null) ? true : false;
}

function createEl(element = 'div') {
  return document.createElement(element);
}

function emptyEl(el) {
  while(el.firstChild)
  el.removeChild(el.firstChild);
}

function elem(selector, parent = document){
  let elem = isObj(parent) ? parent.querySelector(selector) : false;
  return elem ? elem : false;
}

function elems(selector, parent = document) {
  let elems = isObj(parent) ? parent.querySelectorAll(selector) : [];
  return elems.length ? elems : false;
}

function pushClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    let elClass = el.classList;
    elClass.contains(targetClass) ? false : elClass.add(targetClass);
  }
}

function deleteClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    let elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : false;
  }
}

function modifyClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    const elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : elClass.add(targetClass);
  }
}

function containsClass(el, targetClass) {
  if (isObj(el) && targetClass && el !== document ) {
    return el.classList.contains(targetClass) ? true : false;
  }
}

function isChild(node, parentClass) {
  let objectsAreValid = isObj(node) && parentClass && typeof parentClass == 'string';
  return (objectsAreValid && node.closest(parentClass)) ? true : false;
}

function elemAttribute(elem, attr, value = null) {
  if (value) {
    elem.setAttribute(attr, value);
  } else {
    value = elem.getAttribute(attr);
    return value ? value : false;
  }
}

function deleteChars(str, subs) {
  let newStr = str;
  if (Array.isArray(subs)) {
    for (let i = 0; i < subs.length; i++) {
      newStr = newStr.replace(subs[i], '');
    }
  } else {
    newStr = newStr.replace(subs, '');
  }
  return newStr;
}

function isBlank(str) {
  return (!str || str.trim().length === 0);
}

function isMatch(element, selectors) {
  if(isObj(element)) {
    if(selectors.isArray) {
      let matching = selectors.map(function(selector){
        return element.matches(selector)
      })
      return matching.includes(true);
    }
    return element.matches(selectors)
  }
}

function closestInt(goal, collection) {
  return collection.reduce(function (prev, curr) {
    return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
  });
}

function hasClasses(el) {
  if(isObj(el)) {
    const classes = el.classList;
    return classes.length
  }
}

function wrapEl(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}


function parseBoolean(string) {
  string = string.trim().toLowerCase();
  switch (string) {
    case 'true':
    return true;
    case 'false':
    return false;
    default:
    return undefined;
  }
}

function copyToClipboard(str) {
  let copy, selection, selected;
  copy = createEl('textarea');
  copy.value = str;
  copy.setAttribute('readonly', '');
  copy.style.position = 'absolute';
  copy.style.left = '-9999px';
  selection = document.getSelection();
  doc.appendChild(copy);
  // check if there is any selected content
  selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  copy.select();
  document.execCommand('copy');
  doc.removeChild(copy);
  if (selected) { // if a selection existed before copying
    selection.removeAllRanges(); // unselect existing selection
    selection.addRange(selected); // restore the original selection
  }
}

function insertBefore(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode);
}

(function() {
  (function shareItem() {
    const copyToClipboard = str => {
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
      document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }
      const copyText = document.createElement('div');
      copyText.classList.add('share_copy');
      copyText.innerText = 'Link Copied';
      // check if there's another notification
      let shareItems = Array.from(elem('.share').children);
      let shareLength = shareItems.length;
      let lastIndex = shareLength - 1;
      let lastShareItem = shareItems[lastIndex];
      if(lastShareItem.classList.contains('share_copy') == false) {
        elem('.share').appendChild(copyText);
        setTimeout(function() {
          elem('.share').removeChild(copyText)
        }, 4000);
      }
    };
    const postContent = elem('.post_content');

    if(postContent) {
      postContent.addEventListener('click', function(event) {
        let shareTrigger = event.target.closest('.share_item');
        if(shareTrigger) {
          let copyclass = shareTrigger.classList.contains('copy') ? true : false;
          let shareSrc = shareTrigger.href;
          event.preventDefault();
          if(copyclass) {
            copyToClipboard(shareSrc);
          } else {
            window.open(shareSrc, 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
          }
        }
      });
    }
  })();
})();

//function createCopyButton(codeNode) {
  //const copyBtn = createEl('button')
  //copyBtn.className = 'code-copy-btn'
  //copyBtn.type = 'button'
  //copyBtn.innerText = 'copy'

  //let resetTimer
  //copyBtn.addEventListener('click', () => {
    //navigator.clipboard.writeText(codeNode.innerText).then(() => {
      //copyBtn.innerText = 'copied!'
    //}).then(() => {
      //clearTimeout(resetTimer)
      //resetTimer = setTimeout(() => {
        //copyBtn.innerText = 'copy'
      //}, 1000)
    //})
  //})

  //return copyBtn
//}

//document.querySelectorAll('pre > code')
//.forEach((codeNode) => {
  //const copyBtn = createCopyButton(codeNode);
  //codeNode.parentNode.insertBefore(copyBtn, codeNode);
//});

// document.querySelectorAll('.highlight table > tbody > tr > td:first-child .code-copy-btn')
// .forEach((btn) => {
//   btn.remove()
// })

//function toggleMobileMenu(event) {
  //const target = event.target;
  //event.preventDefault();
  //const activeClass = 'responsive';
  //const menuEl = target.closest('ul');
  //modifyClass(menuEl, activeClass);
//}

function loadActions() {
  const light = 'light';
  const dark = 'dark';
  const storageKey = 'colorMode';
  const key = '--color-mode';
  const data = 'data-mode';

  function prefersColor(mode){
    return `(prefers-color-scheme: ${mode})`;
  }

  function systemMode() {
    if (window.matchMedia) {
      const prefers = prefersColor(dark);
      return window.matchMedia(prefers).matches ? dark : light;
    }
    return light;
  }

  function currentMode() {
    let acceptableChars = light + dark;
    acceptableChars = [...acceptableChars];
    let mode = getComputedStyle(doc).getPropertyValue(key).replace(/\"/g, '').trim();

    mode = [...mode].filter(function(letter){
      return acceptableChars.includes(letter);
    });

    return mode.join('');
  }

  /**
  * @param isDarkMode true means from dark to light, false means from light to dark
  */
  function changeMode(isDarkMode) {
    if(isDarkMode) {
      window.localStorage.setItem(storageKey, light)
      elemAttribute(doc, data, light);
    } else {
      window.localStorage.setItem(storageKey, dark);
      elemAttribute(doc, data, dark);
    }
  }

  function pickModePicture(user, system, context) {
    const pictures = elems('picture');
    if(pictures) {
      pictures.forEach(function(picture){
        let source = picture.firstElementChild;
        if(user == system) {
          context ? source.media = prefersColor(dark) : false;
        } else {
          if(system == light) {
            source.media = (user === dark) ? prefersColor(light) : prefersColor(dark) ;
          } else {
            source.media = (user === dark) ? prefersColor(dark) : prefersColor(light) ;
          }
        }
      });
    }
  }

  function toggleColorMode(mode = false) {
    const isDarkMode = currentMode() != light;
    const sysMode = systemMode();
    changeMode(isDarkMode);
    const userMode = doc.dataset.mode;
    doc.dataset.systemmode = sysMode;
    if(userMode) {
      pickModePicture(userMode,sysMode,mode);
    }
  }

  (function updateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const yearEl = elem('.year');
    yearEl ? year.innerHTML = year : false;
  })();

  current = document.URL;

  (function lazy() {
    function lazyLoadMedia(element) {
      let mediaItems = elems(element);
      if(mediaItems) {
        Array.from(mediaItems).forEach(function(item) {
          item.loading = "lazy";
        });
      }
    }
    lazyLoadMedia('iframe');
    lazyLoadMedia('img');
  })();

  (function makeTablesResponsive(){
    const tables = elems('table');
    if (tables) {
      tables.forEach(function(table){
        const tableWrapper = createEl();
        pushClass(tableWrapper, 'scrollable');
        wrapEl(table, tableWrapper);
      });
    }
  })();

  //doc.addEventListener('click', function(event) {
    //const target = event.target;
    //let modeClass = 'modse-specific';
    //let navToggleClass = 'nav_toggle';
    //let isModeToggle = containsClass(target, modeClass);
    //let isNavToggle = containsClass(target, navToggleClass) || target.closest(`.${navToggleClass}`);

    //isModeToggle ? setUserColorMode(true) : false;
    //isNavToggle ? toggleMobileMenu(event) : false;
  //});

{
  const elements = document.getElementsByClassName('mode-toggle');
  Array.from(elements).forEach(element => {
	  element.addEventListener('click', () =>toggleColorMode() );
  });
}
 
//{
  //const elements = document.getElementsByClassName('nav_toggle');
  //Array.from(elements).forEach(element => {
	  //element.addEventListener('click', event =>toggleMobileMenu(event) );
  //});
//}

}

//loadActions()
//window.addEventListener('DOMContentLoaded', loadActions());

document.addEventListener('readystatechange', function() {
  console.log(document.readyState);
  if (document.readyState === 'interactive') {
    loadActions();
  }
});

// main.js
//

if (typeof Element.prototype.justifiedGallery !== 'undefined') {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  var articleGalleryElements = document.getElementsByClassName("article-gallery");
  Array.prototype.forEach.call(articleGalleryElements, function(element) {
    justifiedGallery(element, options);
  });
}

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(function() {
  if (document.getElementsByClassName("post").length > 0) {
    var menu = document.getElementById("menu");
    var nav = document.querySelector("#menu > #nav");
    var menuIcon = document.querySelectorAll("#menu-icon, #menu-icon-tablet");

    if (window.innerWidth >= 1440) {
      menu.style.visibility = "visible";
      Array.prototype.forEach.call(menuIcon, function(element) {
        element.classList.add("active");
      });
    }

    Array.prototype.forEach.call(menuIcon, function(element) {
      element.addEventListener("click", function() {
        if (menu.style.visibility === "hidden") {
          menu.style.visibility = "visible";
          Array.prototype.forEach.call(menuIcon, function(element) {
            element.classList.add("active");
          });
        } else {
          menu.style.visibility = "hidden";
          Array.prototype.forEach.call(menuIcon, function(element) {
            element.classList.remove("active");
          });
        }
        return false;
      });
    });

    if (menu) {
      window.addEventListener("scroll", function() {
        var topDistance = menu.offsetTop;

        if (!nav.style.display && topDistance < 50) {
          nav.style.display = "block";
        } else if (nav.style.display === "block" && topDistance > 100) {
          nav.style.display = "none";
        }

        if (!document.querySelector("#menu-icon").offsetParent && topDistance < 50) {
          document.querySelector("#menu-icon-tablet").style.display = "block";
          document.querySelector("#top-icon-tablet").style.display = "none";
        } else if (!document.querySelector("#menu-icon").offsetParent && topDistance > 100) {
          document.querySelector("#menu-icon-tablet").style.display = "none";
          document.querySelector("#top-icon-tablet").style.display = "block";
        }
      });
    }

    if (document.getElementById("footer-post")) {
      var lastScrollTop = 0;
      window.addEventListener("scroll", function() {
        var topDistance = window.pageYOffset || document.documentElement.scrollTop;

        if (topDistance > lastScrollTop) {
          document.getElementById("footer-post").style.display = "none";
        } else {
          document.getElementById("footer-post").style.display = "block";
        }
        lastScrollTop = topDistance;

        document.getElementById("nav-footer").style.display = "none";
        document.getElementById("toc-footer").style.display = "none";
        document.getElementById("share-footer").style.display = "none";

        if (topDistance < 50) {
          document.querySelector("#actions-footer > #top").style.display = "none";
        } else if (topDistance > 100) {
          document.querySelector("#actions-footer > #top").style.display = "block";
        }
      });
    }
  }
});






