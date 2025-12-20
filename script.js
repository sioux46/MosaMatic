let manualMode = false;
let selectedPiece = { w: 1, h: 1, class: 'c1' };
let frameColor = "#444444";
let backColor = "#444444";
let borderColor = "#444444";
let frameSize = "6px";
let borderSize = "4px";
let paddingSize = "4px";
let timer = null;
let min = 100;
let max = 5000;
let tapTimer = null;
let tapDelay = 300; // délai max entre deux taps
let formVisible = true;
const colGauche = 'col-md-6 col-sm-8'; // 'col-lg-6 col-md-7 col-sm-8'; // form
const colDroite = 'col-md-6 col-sm-4'; // 'col-lg-6 col-md-5 col-sm-4'; // mosaic
let mosaPixUnit = 0.002;
let $frameSize = $("#frameSize");
let $frameSize2 = $("#frameSize2");
let flagSubmit = true;
const SIDE_UNITS = 100;
const MIN_VISIBLE_UNITS = 4;
let mosaic;
let jqMosaic;


function generateMosaicGrid() {

    let H = parseInt($('#height').val());
    let L = parseInt($('#width').val());

    let colors = {
        c1: $('#color1').val(), c2: $('#color2').val(),
        c3: $('#color3').val(), c4: $('#color4').val()
    };

    let pieces = [
        { w: 1, h: 1, class: 'c1' },
        { w: 2, h: 2, class: 'c2' },
        { w: 2, h: 1, class: 'c3' },
        { w: 1, h: 2, class: 'c4' },
    ];

    let grid = Array.from({ length: H }, () => Array(L).fill(null));
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < L; j++) {
            if (grid[i][j] !== null) continue;
            let piece = pieces[Math.floor(Math.random() * pieces.length)];
            if (canPlace(grid, i, j, piece.h, piece.w, H, L)) {
                placePiece(grid, i, j, piece.h, piece.w, piece.class);
            } else {
                grid[i][j] = 'c1';
            }
        }
    }
    renderGrid(grid, H, L, colors);
}

function renderGrid(grid, H, L, colors) {
    let html = `<div id="mosaicGridOverlay">
                <div id="mosaic" style="grid-template-columns: repeat(${L}, 1fr);">`;
    grid.flat().forEach((type, i) => {
        html += `<div class="tile ${type}" style="background-color:${colors[type]};  aspect-ratio: 1;"></div>`;
    });
    html += '</div></div>';

    document.documentElement.style.setProperty('--rows', H);
    document.documentElement.style.setProperty('--cols', L);
    $('#mosaicContainer').html(html);

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    mosaic = $("#mosaic")[0];
    jqMosaic = $("#mosaic");

    $(".tile").click(function () {
        if (!manualMode) return;
        let idx = $(".tile").index(this);
        let row = Math.floor(idx / L);
        let col = idx % L;
        placeManualPiece(row, col);
    });

    let borderColor = $("#borderColor").val();
    let borderPix = mosaPix2();
    let radius = $("#angle").val() + "px";

    //////           start $(".tile").each
    $(".tile").each(function (index) {
      let tile = this;
      let row = Math.floor(index / L);
      let col = index % L;
      let cls = tile.classList[1];

      let borders = {};

      // Vérifie chaque direction (haut, droite, bas, gauche)
      borders.top = row === 0 || grid[row - 1][col] !== cls;
      borders.right = col === L - 1 || grid[row][col + 1] !== cls;
      borders.bottom = row === H - 1 || grid[row + 1][col] !== cls;
      borders.left = col === 0 || grid[row][col - 1] !== cls;

      // Remember border width
      $(tile).attr("data-border-top", borders.top);
      $(tile).attr("data-border-right", borders.right);
      $(tile).attr("data-border-bottom", borders.bottom);
      $(tile).attr("data-border-left", borders.left);
/*
      if ( $("#tileBorder").get(0).checked ) {
        if ( H < 20 || L < 20 ) borderPix = "4px";
        else if ( H < 40 || L < 40 ) borderPix = "3px";
        else if ( H < 60 || L < 60 ) borderPix = "2px";
        else if ( H < 120 || L < 120 ) borderPix = "1px";
        else borderPix = "0px";
      }
*/
      // Applique les bordures si nécessaires
      tile.style.borderTop = borders.top ? borderPix + " solid " + borderColor : "none";
      tile.style.borderRight = borders.right ?  borderPix + " solid " + borderColor : "none";
      tile.style.borderBottom = borders.bottom ?  borderPix + " solid " + borderColor : "none";
      tile.style.borderLeft = borders.left ?  borderPix + " solid " + borderColor : "none";

      // Coins arrondis
      tile.style.borderTopLeftRadius = borders.top && borders.left ? radius : "0";
      tile.style.borderTopRightRadius = borders.top && borders.right ? radius : "0";
      tile.style.borderBottomLeftRadius = borders.bottom && borders.left ? radius : "0";
      tile.style.borderBottomRightRadius = borders.bottom && borders.right ? radius : "0";

    }); /////    end $(".tile").each


    // tiles visibility
    if ( $("#tilec1")[0].checked )  $(".tile.c1").css("visibility", "visible");
    else $(".tile.c1").css("visibility", "hidden");
    if ( $("#tilec2")[0].checked )  $(".tile.c2").css("visibility", "visible");
    else $(".tile.c2").css("visibility", "hidden");
    if ( $("#tilec3")[0].checked )  $(".tile.c3").css("visibility", "visible");
    else $(".tile.c3").css("visibility", "hidden");
    if ( $("#tilec4")[0].checked )  $(".tile.c4").css("visibility", "visible");
    else $(".tile.c4").css("visibility", "hidden");

    // Applique le cadre si nécessaire
    // let frame = $("#frame").get(0).checked;
    let bord = $("#mosaic").css("border-width");
    $("#mosaic").css("border", bord + " solid " + $("#frameColor").val());
    // else $("#mosaic").css("border", "6px solid white");

    let mosaAngle = mosaPix($("#frameAngle").val()) + "px";
    $("#mosaic").css("border-radius", mosaAngle);
    let frameSize = mosaPix($("#frameSize").val()) + "px";
    $("#mosaic").css("border-width", frameSize);
    let paddingSize = mosaPix($("#paddingSize").val()) + "px";
    $("#mosaic").css("padding", paddingSize);

    let back = $("#back").get(0).checked;
    if ( back) $("#mosaic").css("background-color", backColor);
    else $("#mosaic").css("background-color", "#fff");

    let rogner = $("#rogner").get(0).checked;
    if ( rogner )
          $("#mosaic").css("overflow", "clip");
    else  $("#mosaic").css("overflow", "visible");

    //$("#mosaicGridOverlay").css("display", "none");
    if ( $("#box")[0].checked ) boxOn(); else boxOff();

}
////////////////////////////////// E N D renderGrid

function setupManualSelector() {
    let html = `
    <div id="manualPieceSelector">
        <button style="background:${$('#color1').val()}" onclick="setManualPiece(1,1,'c1')"></button>
        <button style="background:${$('#color2').val()}" onclick="setManualPiece(2,2,'c2')"></button>
        <button style="background:${$('#color3').val()}" onclick="setManualPiece(1,2,'c3')"></button>
        <button style="background:${$('#color4').val()}" onclick="setManualPiece(2,1,'c4')"></button>
    </div>`;
    $('#mosaicContainer').before(html);
}

function setManualPiece(w, h, cls) {
    selectedPiece = { w, h, class: cls };
}

function placeManualPiece(i, j) {
    let grid = $("#mosaic")[0].children;
    let L = parseInt($('#width').val());
    for (let r = 0; r < selectedPiece.h; r++) {
        for (let c = 0; c < selectedPiece.w; c++) {
            let idx = (i + r) * L + (j + c);
            if (grid[idx]) {
                grid[idx].style.backgroundColor = $('#' + selectedPiece.class).val();
                grid[idx].className = `tile ${selectedPiece.class}`;
            }
        }
    }
}

function canPlace(grid, y, x, dh, dw, H, L) {
    if (y + dh > H || x + dw > L) return false;
    for (let i = y; i < y + dh; i++) {
        for (let j = x; j < x + dw; j++) {
            if (grid[i][j] !== null) return false;
        }
    }
    return true;
}

function placePiece(grid, y, x, dh, dw, cls) {
    for (let i = y; i < y + dh; i++) {
        for (let j = x; j < x + dw; j++) {
            grid[i][j] = cls;
        }
    }
}

function changeRadius(val) {
  let v = mosaPix(val);
  // if ( v <= 0 ) v = 1;  ? inutile
  v = v + "px";
  let tiles = document.querySelectorAll(".tile");

  const corners = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
];
  for ( let t of tiles ) {
    const cs = getComputedStyle(t);
      for (const prop of corners) {
        if (cs[prop] !== "0px") {
          t.style[prop] = v;
        }
      }
  }
}

function changeColor(color, val) {
  let tiles = $(".tile");
  let rgb;
  for ( let t of tiles ) {
    if ( $(t).hasClass(color) ) {
      rgb = hexToRgb(val);
      $(t).css("background-color", rgb);
    }
  }
}

/*function changeFrame(frame) {  // not used

  let color;
  if ( frame ) color = $("#frameColor").val();
  else color = "white";
  let padding;

  if ( !frame ) {
    $("#mosaic").css("border", 0);
  }
  else {
    $("#mosaic").css("border-radius", mosaPix($("#frameAngle").val()) + "px");
    $("#mosaic").css("border", mosaPix($("#frameSize").val()) + "px solid " + color);
  }
}
*/


function rgbToHex(rgb) {
  // extrait les nombres de la chaîne "rgb(r, g, b)"
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  // convertit chaque composante en hex et pad avec un 0 si nécessaire
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
// Exemple
// console.log(rgbToHex('rgb(12, 34, 56)')); // → #0c2238

function hexToRgb(hex) {
  // enlève le # si présent
  hex = hex.replace(/^#/, '');

  // gestion du format court #rgb
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
}
// Exemples
// console.log(hexToRgb("#0c2238")); // → rgb(12, 34, 56)
// console.log(hexToRgb("#fff"));    // → rgb(255, 255, 255)

////// Animation
function animagic() {
  let value = parseFloat($("#anim2").val());       // valeur brute du slider
  let t = (value - min) / (max - min);         // normalisation 0 → 1
  let time = min * Math.pow(max / min, t);      // progression géométrique

  timer = setInterval(function() {
    $("#submit").trigger("click"); // génère la nouvelle mosaïque
  }, time);
}


////// fullScreen
function handleDouble() {
    console.log("DOUBLE CLIC / DOUBLE TAP !");
    if ( formVisible ) {
       // Masquer colonne gauche avec slide
       $("#col-gauche").slideUp(400, function () {
           // Une fois le slide terminé, élargir la colonne droite
           //$("#col-droite").removeClass("col-lg-5").removeClass("col-sm-4").addClass("col-12");
           $("#col-droite")[0].classList.value = "col-12";
       });
   } else {
       // Rétrécir la colonne droite avant de réafficher la gauche
       //$("#col-droite").removeClass("col-12").addClass("col-lg-5").addClass("col-sm-4");
       $("#col-droite")[0].classList.value = colDroite;

       // Réafficher la colonne gauche
       window.scrollTo({
         top: document.documentElement.scrollHeight,
         behavior: 'smooth' // optional
       });

       $("#col-gauche").slideDown(400);
       setTimeout(function () {
         window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth' // optional
              });
          }, 400);

        }
        formVisible = !formVisible;
}

////////   requestAnimationFrame
let rafId = null;
function scheduleUpdate() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    generateMosaicGrid();  // updateTileBorder();
    rafId = null;
  });
}


/////////////////////////////////  setBorderSize
function setBorderSize() {
  const slider = document.getElementById("borderSize2");
  const sliderValue = parseInt(slider.value, 10);
  const mosaicRect = mosaic.getBoundingClientRect();
  const rows = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--rows'), 10);
  const cols = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--cols'), 10);

  // taille réelle d’un tile
  const tileSize = Math.min(
    mosaicRect.width / cols,
    mosaicRect.height / rows
  );

   // bordure maximale autorisée (reste visible au centre)
   const borderMaxPx = tileSize * 0.45;

   // slider = pourcentage du maximum
   const borderPx = (sliderValue / 100) * borderMaxPx + "px";

   document.querySelectorAll(".tile").forEach(t => {
       if (t.dataset.borderTop === "true")    t.style.borderTopWidth    = borderPx;
       if (t.dataset.borderRight === "true")  t.style.borderRightWidth  = borderPx;
       if (t.dataset.borderBottom === "true") t.style.borderBottomWidth = borderPx;
       if (t.dataset.borderLeft === "true")   t.style.borderLeftWidth   = borderPx;
    });
}


/////// carrelage on off (box)
function boxOn() {
  $(".tile").css({"box-shadow": "0 0 0 0.3px currentColor", "tansform": "translate(-0.3px, -0.3px)"});
}
function boxOff() {
  $(".tile").css({"box-shadow": "0 0 0 0", "tansform": "none"});
}

////// MMM pix size unit
function mosaPix(val) {
  //return val;sc
  const mosaic = $("#mosaic");
  if ( mosaic.height() > mosaic.width() ) return val * mosaPixUnit * mosaic.width();
  else return val * mosaPixUnit * mosaic.height();
}

function mosaPix2() {  /// for redraw only
  const slider = document.getElementById("borderSize2");
  const sliderValue = parseInt(slider.value, 10);
  const mosaicRect = mosaic.getBoundingClientRect();
  const rows = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--rows'), 10);
  const cols = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--cols'), 10);

  // taille réelle d’un tile
  const tileSize = Math.min(
    mosaicRect.width / cols,
    mosaicRect.height / rows
  );

  // bordure maximale autorisée (reste visible au centre)
  const borderMaxPx = tileSize * 0.45;

  // slider = pourcentage du maximum
  const borderPx = (sliderValue / 100) * borderMaxPx;

  return borderPx + 'px';
}

//////
function saveForm(name) {
  const data = {};

  document.querySelectorAll('#mosaicForm input').forEach(input => {
    if (input.type === 'checkbox') {
      data[input.id] = input.checked;
    } else {
      data[input.id] = input.value;
    }
  });

  localStorage.setItem('mosaic_' + name, JSON.stringify(data));
  //if ( name != "_auto" ) alert(name + '" enregistrée');
}

//////
function loadForm(name) {
  const saved = localStorage.getItem('mosaic_' + name);
  if (!saved) {
    //alert('Zéro sauvegarde');
    return;
  }
  //refreshSaveSelect();
  const data = JSON.parse(saved);

  Object.keys(data).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    if (input.type === 'checkbox') input.checked = data[id];
    else input.value = data[id];

    // Forcer la mise à jour des éventuels listeners
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
  });

  if ( $("#anim")[0].checked ) animagic($("#anim2").val());
  $("#submit").trigger("click");
  //alert(name + '" chargée');
}

//////
function listSaves() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('mosaic_'))
    .map(k => k.replace('mosaic_', ''));
}
function getSaveList() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('mosaic_'))
    .map(k => k.replace('mosaic_', ''))
    .sort();
}
function refreshSaveSelect() {
  const select = document.getElementById('loadSelect');
  select.innerHTML = '<option value="">Charger…</option>';

  getSaveList().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}
//  delete
function deleteSave(name) {
  if (!localStorage.getItem('mosaic_' + name)) return;

  if (!confirm('Supprimer "' + name + '" ?')) return;

  localStorage.removeItem('mosaic_' + name);
  refreshSaveSelect();
  refreshDeleteSelect();

  if (document.getElementById('saveName').value === name) {
    document.getElementById('saveName').value = '';
  }
}

function refreshDeleteSelect() {
  const select = document.getElementById('deleteSelect');
  select.innerHTML = '<option value="">Supprimer…</option>';

  getSaveList().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

// synchro
function refreshAllMenus() {
  refreshSaveSelect();
  refreshDeleteSelect();
  //toggleDeleteMenu();
}

function toggleDeleteMenu() {
  const select = document.getElementById('deleteSelect');
  select.disabled = getSaveList().length === 0;
}





function resizeMosaic() {
    const container = document.getElementById('mosaicContainer');

    // Force recalcul après rotation iOS
    container.style.width = '100%';
    container.style.maxWidth = '100%';

    // Si tu utilises un canvas
    const canvas = container.querySelector('canvas');
    if (canvas) {
        const rect = container.getBoundingClientRect();
        canvas.width  = rect.width;
        canvas.height = rect.width; // ou height si non carré
    }

    // relancer le rendu si nécessaire
    if (typeof drawMosaic === 'function') {
        drawMosaic();
    }
}

// iOS friendly
window.addEventListener('orientationchange', () => {
    setTimeout(resizeMosaic, 300);
});

window.addEventListener('resize', () => {
    setTimeout(resizeMosaic, 300);
});

  //***************************************** FIN FONCTIONS  **********



///////////////////////////////////////////////////////////////////                 //////
///////////////////////////////////////////////////////////////////  R  E  A  D  Y  //////
///////////////////////////////////////////////////////////////////                 //////
$(document).ready(function () {

  // screenshot
  document.getElementById("btnCapture").addEventListener("click", () => {
    const node = document.getElementById("mosaic");

    // to .png
    domtoimage.toPng(node)
    .then(dataUrl => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "MosaMagic.png";
      link.click();
    })
    .catch(err => console.error(err));
/*
    // to clipboard
    domtoimage.toBlob(node, { // erreur CSS cross-origin
      filter: function (node) {
        return true;
      }
    });
    domtoimage.toBlob(node)
    .then(function (blob) {
      return navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);
    })
    .then(function () {
      console.log("📋 Image copiée dans le presse-papiers");
    })
    .catch(function (err) {
      console.error("Erreur clipboard :", err);
    });
*/
  });

  // save
  window.addEventListener('beforeunload', () => {
    saveForm('_auto');
  });
  document.getElementById('saveBtn').addEventListener('click', () => {
    const name = document.getElementById('saveName').value.trim();
    if (!name) {
      alert('Veuillez donner un nom à la sauvegarde');
      return;
    }
    saveForm(name);
    refreshAllMenus();
  });
  // load
  document.getElementById('loadSelect').addEventListener('change', function () {
    if (!this.value) return;
    loadForm(this.value);
    this.value = '';
  });
  // delele
  document.getElementById('deleteSelect').addEventListener('change', function () {
    if (!this.value) return;
    deleteSave(this.value);
    this.value = '';
  });

// gestion double click
/*
  $("#mosaicContainer").on("click", function (e) {
    // Gestion du double-clic desktop (natif)
    // → e.detail === 2 signifie "2 clics"
    event.preventDefault();
    if (e.detail === 2) {
        handleDouble();
        return;
    }
    // Gestion du double-tap mobile
    if (tapTimer == null) {
        tapTimer = setTimeout(() => {
            tapTimer = null;
        }, tapDelay);
    } else {
        clearTimeout(tapTimer);
        tapTimer = null;
        handleDouble();
    }
  });
*/


  $(function() {
    var lastUpTime = 0, lastX = 0, lastY = 0;
    var THRESH_MS = 350, THRESH_PX = 30;
    var singleTimer = null;

    $('#mosaicContainer').on('pointerup', function(e){
      var now = Date.now();
      var x = e.originalEvent.clientX, y = e.originalEvent.clientY;
      var $el = $(this);

      if (now - lastUpTime < THRESH_MS &&
          Math.abs(x - lastX) < THRESH_PX &&
          Math.abs(y - lastY) < THRESH_PX) {
        clearTimeout(singleTimer);
        // double detected
        doubleAction($el, e);
        lastUpTime = 0;
      } else {
        // schedule single
        lastUpTime = now; lastX = x; lastY = y;
        clearTimeout(singleTimer);
        singleTimer = setTimeout(function(){
          singleAction($el, e);
          lastUpTime = 0;
        }, THRESH_MS + 20);
      }
    });


    function singleAction($el, e){
       console.log('single', $el);
       $("#submit").trigger("click");
    }
    function doubleAction($el, e){
      console.log('double', $el);
      //handleDouble();
    }
  });

  /////////////////////////////////
  $("#btnZoom").on("click", function(e) {
    if ( formVisible ) $("#this").css("backgroundColor", "#aaa");
    else $("#this").css("backgroundColor", "#eee");
    handleDouble();
  });

  ////// Animation
  $(document).on("input", "#anim", function(e) {

    if ( this.checked ) {
      $("#submit").trigger("click");
      animagic($("#anim2").val());
    }
    else clearInterval(timer);
  });

  $(document).on("input", "#anim2", function(e) {
    if ( $("#anim")[0].checked ) {
      let value = parseFloat($(this).val());       // valeur brute du slider
      let t = (value - min) / (max - min);         // normalisation 0 → 1
      let val = min * Math.pow(max / min, t);      // progression géométrique
      clearInterval(timer);
      time = val;
      animagic(val);
    }
  });

////// color
  $(document).on("input", "#color1", function(e) {
    changeColor("c1", this.value);
  });
  $(document).on("input", "#color2", function(e) {
    changeColor("c2", this.value);
  });
  $(document).on("input", "#color3", function(e) {
    changeColor("c3", this.value);
  });
  $(document).on("input", "#color4", function(e) {
    changeColor("c4", this.value);
  });


  ////// angle
  $(document).on("input", "#angle", function(e) {
    changeRadius(this.value);
    $("#angle2").val(this.value);
  });
  $(document).on("input", "#angle2", function (e) {
    changeRadius(this.value);
    $("#angle").val(this.value);
  });

  ////// frameAngle
  $(document).on("input", "#frameAngle", function(e) {
    $("#mosaic").css("border-radius", mosaPix($("#frameAngle").val()) + "px");
    $("#frameAngle2").val(this.value);
  });
  $(document).on("input", "#frameAngle2", function (e) {
    $("#mosaic").css("border-radius", mosaPix($("#frameAngle2").val()) + "px");
    $("#frameAngle").val(this.value);
    if ( $("#frameAngle").val() == "0" )
          $("#mosaic").css("border-radius", 0);
  });

  ////// frameSize
  $(document).on("input", "#frameSize", function(e) {
    $("#mosaic").css("border-width", mosaPix($frameSize.val()) + "px");
    $frameSize2.val(this.value);
  });
  $(document).on("input", "#frameSize2", function (e) {
    $("#mosaic").css("border-width", mosaPix($frameSize2.val()) + "px");
    $frameSize.val(this.value);
    //$("#frameSize2").val(this.value);
    if ( $frameSize.val() == "0" )
          $("#mosaic").css("border-width", 0);
  });

  ////// borderSize
  $(document).on("input", "#borderSize", function(e) {
    $("#borderSize2").val(this.value);
    setBorderSize();
  });
  $(document).on("input", "#borderSize2", function (e) {
    $("#borderSize").val(this.value);
    setBorderSize();
  });

  ////// paddingSize
  $(document).on("input", "#paddingSize", function(e) {
    $("#mosaic").css("padding", mosaPix($("#paddingSize").val()) + "px");
    $("#paddingSize2").val(this.value);
    //$("#paddingSize").val(this.value);

  });
  $(document).on("input", "#paddingSize2", function (e) {
    $("#mosaic").css("padding", mosaPix($("#paddingSize2").val()) + "px");
    //$("#paddingSize2").val(this.value);
    $("#paddingSize").val(this.value);
    if ( $("#paddingSize").val() == "0" )
          $("#mosaic").css("padding", 0);
  });

  ////// H & L
  $(document).on("input", "#height", function(e) {
    $("#height2").val(this.value);

    if ( $("#square")[0].checked ) {
      $("#width").val(this.value);
      $("#width2").val(this.value);
    }
    $("#submit").trigger("click");
  });
/////
  $(document).on("input", "#height2", function(e) {
    $("#height").val(this.value);

    if ( $("#square")[0].checked ) {
      $("#width").val(this.value);
      $("#width2").val(this.value);
    }
    $("#submit").trigger("click");
  });
///////
  $(document).on("input", "#width", function(e) {
    $("#width2").val(this.value);

    if ( $("#square")[0].checked ) {
      $("#height").val(this.value);
      $("#height2").val(this.value);
    }
    $("#submit").trigger("click");
  });
/////
  $(document).on("input", "#width2", function(e) {
    $("#width").val(this.value);

    if ( $("#square")[0].checked ) {
      $("#height").val(this.value);
      $("#height2").val(this.value);
    }
    $("#submit").trigger("click");
  });

/////
  $(document).on("input", "#tilec1", function(e) {
    if  ( $("#tilec1")[0].checked )
            $(".c1").css("visibility", "visible");
    else  $(".c1").css("visibility", "hidden");
  });

  $(document).on("input", "#tilec2", function(e) {
    if  ( $("#tilec2")[0].checked )
            $(".c2").css("visibility", "visible");
    else  $(".c2").css("visibility", "hidden");
  });

  $(document).on("input", "#tilec3", function(e) {
    if  ( $("#tilec3")[0].checked )
            $(".c3").css("visibility", "visible");
    else  $(".c3").css("visibility", "hidden");
  });

  $(document).on("input", "#tilec4", function(e) {
    if  ( $("#tilec4")[0].checked )
            $(".c4").css("visibility", "visible");
    else  $(".c4").css("visibility", "hidden");
  });

/*
  $(document).on("input", "#frame", function(e) {
    changeFrame(this.checked);
  });
*/

  $(document).on("input", "#rogner", function(e) {
    if ( this.checked )
        $("#mosaic").css("overflow", "clip");
    else $("#mosaic").css("overflow", "visible");
  });

  $(document).on("input", "#pad", function(e) {
    if ( this.checked )
        $("#mosaic").css("padding", "4px");
    else $("#mosaic").css("padding", 0);
  });

  $(document).on("input", "#borderColor", function(e) {
    borderColor = this.value;
    $(".tile").css("border-color", borderColor);
  });

  $(document).on("input", "#frameColor", function(e) {
    frameColor = this.value;
    $("#mosaic").css("border-color", frameColor);
  });

  $(document).on("input", "#back", function(e) {
    if  ( $("#back")[0].checked )
            $("#mosaic").css("background-color", backColor);
    else  $("#mosaic").css("background-color", "#ffffff");
  });

  $(document).on("input", "#backColor", function(e) {
    backColor = this.value;
    $("#mosaic").css("background-color", backColor);
  });


  $(document).on("input", "#square", function(e) {
    if ( $("#square")[0].checked && $("#width").val() != $("#height").val() ) {
      if ( Number($("#height").val()) > Number($("#width").val()) ) {
        $("#height").val($("#width").val());
        $("#height2").val($("#width").val());
      }
      else {
        $("#width").val($("#height").val());
        $("#width2").val($("#height").val());
      }
      $("#submit").trigger("click");
    }
  });
//////

  ////// box (carreaux)
  $(document).on("input", "#box", function(e) {
    if ( $("#box")[0].checked ) boxOn();
    else boxOff();
  });


    //////              S U B M I T
  $('#mosaicForm').submit(function (event) {
      event.preventDefault();
      //manualMode = false;
    //  generateMosaicGrid();
    scheduleUpdate();  // requestAnimationFrame
  });

  $('#toggleManualBtn').click(function () {
      manualMode = !manualMode;
      if (manualMode) {
          alert('Mode manuel activé : cliquez sur les cases pour placer des pièces.');
          setupManualSelector();
      } else {
          $('#manualPieceSelector').remove();
      }
  });

  //              P R I N T    mosaic
  $('#exportBtn').click(function () {
      html2canvas(document.querySelector("#mosaicContainer")).then(canvas => {
          let link = document.createElement('a');
          link.href = canvas.toDataURL("image/png");
          link.download = "mosaique.png";
          link.click();
      });
  });

  $("span").click(() => {
    // window.location = "http://localhost:8888/MosaMatic/";
    if ( window.location.href.lastIndexOf("8888") == -1 )
        window.location = "https://www.siouxlog.fr/MosaMagicC/";
  });

  $("#clearBtn").click(() => {
    $("#mosaicContainer").html("");
  });

  $("#submit").trigger("click");
  $("#mosaic").css({border: "4px solid #444 !important"});
  // $("#square").trigger("click");

  //$("#mosaicContainer").on( "click", function() {
  //  $("#anim").trigger("click");
  //});

  $("#col-droite")[0].classList.value = colDroite;
  $("#col-gauche")[0].classList.value = colGauche;

  // Changement de taille d'un div
  const observer = new ResizeObserver(() => {
    // console.log("Le div a changé de taille !");
    setBorderSize();
    changeRadius($("#angle").val());
    let mosaic = $("#mosaic");
    mosaic.css("border-width", mosaPix($frameSize.val()) + "px");
    mosaic.css("border-radius", mosaPix($("#frameAngle").val()) + "px");
    mosaic.css("padding", mosaPix($("#paddingSize").val()) + "px");
  });
  observer.observe($("#mosaicContainer")[0]);

  // charger les Menus
  refreshAllMenus();

  // previous state
  // loadForm("_auto");

});
