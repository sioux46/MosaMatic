let manualMode = false;
let selectedPiece = { w: 1, h: 1, class: 'c1' };
let frameColor = "#444444";
let backColor = "#444444";
let borderColor = "#444444";
let frameSize = "6px";
let borderSize = "4px";
let paddingSize = "4px";
let timer = null;
let min = 50;
let max = 5000;
let tapTimer = null;
let tapDelay = 350; // délai max entre deux taps
let formVisible = true;
let colGauche = 'col-lg-6 col-md-7 col-sm-8'; // form
let colDroite = 'col-lg-6 col-md-5 col-sm-4'; // mosaic

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
    let html = `<div id="mosaic" style="grid-template-columns: repeat(${L}, 1fr);">`;
    grid.flat().forEach(type => {
        html += `<div class="tile ${type}" style="background-color:${colors[type]};  aspect-ratio: 1;"></div>`;
    });
    html += '</div>';


    $('#mosaicContainer').html(html);


    $(".tile").click(function () {
        if (!manualMode) return;
        let idx = $(".tile").index(this);
        let row = Math.floor(idx / L);
        let col = idx % L;
        placeManualPiece(row, col);
    });

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
      let borderPix = "0px;";
      if ( $("#tileBorder").get(0).checked ) {
        if ( H < 20 || L < 20 ) borderPix = "4px";
        else if ( H < 40 || L < 40 ) borderPix = "3px";
        else if ( H < 60 || L < 60 ) borderPix = "2px";
        else if ( H < 120 || L < 120 ) borderPix = "1px";
        else borderPix = "0px";
      }
*/
      borderPix = $("#borderSize").val() + "px";

      // Applique les bordures si nécessaires
      tile.style.borderTop = borders.top ? borderPix + " solid " + $("#borderColor").val() : "none";
      tile.style.borderRight = borders.right ?  borderPix + " solid " + $("#borderColor").val() : "none";
      tile.style.borderBottom = borders.bottom ?  borderPix + " solid " + $("#borderColor").val() : "none";
      tile.style.borderLeft = borders.left ?  borderPix + " solid " + $("#borderColor").val() : "none";

      // Coins arrondis
      let radius = $("#angle").val() + "px"; // "10px"; // Ajustez selon l'effet désiré
      tile.style.borderTopLeftRadius = borders.top && borders.left ? radius : "0";
      tile.style.borderTopRightRadius = borders.top && borders.right ? radius : "0";
      tile.style.borderBottomLeftRadius = borders.bottom && borders.left ? radius : "0";
      tile.style.borderBottomRightRadius = borders.bottom && borders.right ? radius : "0";
    });

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

    let mosaAngle = Number($("#frameAngle").val()) + "px";
    $("#mosaic").css("border-radius", mosaAngle);
    let frameSize = Number($("#frameSize").val()) + "px";
    $("#mosaic").css("border-width", frameSize);
    let paddingSize = Number($("#paddingSize").val()) + "px";
    $("#mosaic").css("padding", paddingSize);

    let back = $("#back").get(0).checked;
    if ( back) $("#mosaic").css("background-color", backColor);
    else $("#mosaic").css("background-color", "#fff");

    let rogner = $("#rogner").get(0).checked;
    if ( rogner )
          $("#mosaic").css("overflow", "clip");
    else  $("#mosaic").css("overflow", "visible");

/*
    let pad = $("#pad").get(0).checked;
    if ( pad )
          $("#mosaic").css("padding", "4px");
    else  $("#mosaic").css("padding", 0);
*/
}


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
  let v = val;
  // if ( v <= 0 ) v = 1;  ? inutile
  v = v + "px";
  let tiles = $(".tile");
  for ( let t of tiles ) {
    if ( $(t).css("border-top-left-radius") != "0px" ) $(t).css("border-top-left-radius", v);
    if ( $(t).css("border-top-right-radius") != "0px" ) $(t).css("border-top-right-radius", v);
    if ( $(t).css("border-bottom-left-radius") != "0px" ) $(t).css("border-bottom-left-radius", v);
    if ( $(t).css("border-bottom-right-radius") != "0px" ) $(t).css("border-bottom-right-radius", v);
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

function changeFrame(frame) {

  let color;
  if ( frame ) color = $("#frameColor").val();
  else color = "white";
  let padding;

  if ( !frame ) {
    $("#mosaic").css("border", 0);
  }
  else {
    $("#mosaic").css("border-radius", $("#frameAngle").val() + "px");
    $("#mosaic").css("border", $("#frameSize").val() + "px solid " + color);
  }
}


function changeSquare(square) {
  if (square) {
    $("#height").val($("#width").val());
    $("#height2").val($("#width").val());
  }
  $("#submit").trigger("click");
}

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
    $("#submit").trigger("click");
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
       $("#col-gauche").slideDown(400);
   }
   formVisible = !formVisible;
}

////// setBorderSize
function setBorderSize() {
  let size = String(Number($("#borderSize").val()) /20);
  $(".tile").each(function (index) {
    if ( $(this).attr("data-border-top") == "true" )
            $(this).css("border-top"  , size + "rem solid " + $("#borderColor").val());
    if ( $(this).attr("data-border-right") == "true" )
            $(this).css("border-right", size + "rem solid " + $("#borderColor").val());
    if ( $(this).attr("data-border-bottom") == "true" )
            $(this).css("border-bottom"  , size + "rem solid " + $("#borderColor").val());
    if ( $(this).attr("data-border-left") == "true" )
          $(this).css("border-left"  , size + "rem solid " + $("#borderColor").val());
  });
}


/////////////////////////////////////////////////////////////////// R E A D Y
$(document).ready(function () {

  // gestion double click
  $("#mosaicContainer").on("click", function (e) {
    // Gestion du double-clic desktop (natif)
    // → e.detail === 2 signifie "2 clics"
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

////// Animation
  $(document).on("input", "#anim", function(e) {
    if ( this.checked )
        animagic($("#anim2").val());
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
      console.log(val);
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
    $("#mosaic").css("border-radius", $("#frameAngle").val() + "px");
    $("#frameAngle2").val(this.value);
  });
  $(document).on("input", "#frameAngle2", function (e) {
    $("#mosaic").css("border-radius", $("#frameAngle").val() + "px");
    $("#frameAngle").val(this.value);
    if ( $("#frameAngle").val() == "0" )
          $("#mosaic").css("border-radius", 0);
  });

  ////// frameSize
  $(document).on("input", "#frameSize", function(e) {
    $("#mosaic").css("border-width", $("#frameSize").val() + "px");
    $("#frameSize2").val(this.value);
  });
  $(document).on("input", "#frameSize2", function (e) {
    $("#mosaic").css("border-width", $("#frameSize").val() + "px");
    $("#frameSize").val(this.value);
    $("#frameSize2").val(this.value);
    if ( $("#frameSize").val() == "0" )
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
    $("#mosaic").css("padding", $("#paddingSize").val() + "px");
    $("#paddingSize2").val(this.value);
    $("#paddingSize").val(this.value);

  });
  $(document).on("input", "#paddingSize2", function (e) {
    $("#mosaic").css("padding", $("#paddingSize").val() + "px");
    $("#paddingSize2").val(this.value);
    $("#paddingSize").val(this.value);
    if ( $("#paddingSize").val() == "0" )
          $("#mosaic").css("padding", 0);
  });

  ////// H & L
  $(document).on("input", "#height", function(e) {
    $("#height2").val(this.value);
  });

  $(document).on("input", "#height2", function(e) {
    $("#height").val(this.value);
  });

  $(document).on("input", "#width", function(e) {
    $("#width2").val(this.value);
  });

  $(document).on("input", "#width2", function(e) {
    $("#width").val(this.value);
  });

  $(document).on("input", "#width, #width2", function(e) {
    if ( $("#square")[0].checked ) {
      $("#height").val($("#width").val());
      $("#height2").val($("#width").val());
    }
    $("#submit").trigger("click");
  });

  $(document).on("input", "#height, #height2", function(e) {
    if ( $("#square")[0].checked ) {
      $("#width").val($("#height").val());
      $("#width2").val($("#height").val());
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
    if ( $("#square")[0].checked && $("#width").val() != $("#height").val() )
                  changeSquare(this.checked);
  });

//////


//////              SUBMIT
  $('#mosaicForm').submit(function (event) {
      event.preventDefault();
      manualMode = false;
      generateMosaicGrid();
  });

  $(document).on("input", "#tileBorder", function(e) {
    if( $("#tileBorder").get(0).checked ) setBorderSize();
    else $(".tile").css("border", 0);
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

  $('#exportBtn').click(function () {
      html2canvas(document.querySelector("#mosaic")).then(canvas => {
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

  $("#mosaicContainer").on( "click", function() {
    $("#anim").trigger("click");
  });

  $("#col-droite")[0].classList.value = colDroite;
  $("#col-gauche")[0].classList.value = colGauche;

  // start anim
  // $("#anim").trigger("click");
});
