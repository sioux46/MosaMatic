let manualMode = false;
let selectedPiece = { w: 1, h: 1, class: 'c1' };
let frameColor = "#444";

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

      let borderPix = "0px;";
      if ( $("#tileBorder").get(0).checked ) {
        if ( H < 20 || L < 20 ) borderPix = "4px";
        else if ( H < 40 || L < 40 ) borderPix = "3px";
        else if ( H < 60 || L < 60 ) borderPix = "2px";
        else if ( H < 120 || L < 120 ) borderPix = "1px";
        else borderPix = "0px";
      }

      // Applique les bordures si nécessaires

        tile.style.borderTop = borders.top ? borderPix + " solid " + frameColor : "none";
        tile.style.borderRight = borders.right ?  borderPix + " solid " + frameColor : "none";
        tile.style.borderBottom = borders.bottom ?  borderPix + " solid " + frameColor : "none";
        tile.style.borderLeft = borders.left ?  borderPix + " solid " + frameColor : "none";



      // Coins arrondis
      let radius = $("#angle").val() + "px"; // "10px"; // Ajustez selon l'effet désiré
      tile.style.borderTopLeftRadius = borders.top && borders.left ? radius : "0";
      tile.style.borderTopRightRadius = borders.top && borders.right ? radius : "0";
      tile.style.borderBottomLeftRadius = borders.bottom && borders.left ? radius : "0";
      tile.style.borderBottomRightRadius = borders.bottom && borders.right ? radius : "0";
    });


    let frame = $("#frame").get(0).checked;
    if ( frame) $("#mosaic").css("border", "6px solid " + frameColor);
    else $("#mosaic").css("border", "6px solid white");
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
  if ( v <= 0 ) v = 1;
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
  if ( frame ) color = frameColor;
  else color = "white";

  if ( /android|iphone|kindle|ipad/i.test(navigator.userAgent) ) {
    $("#mosaic").css("border", "6px solid " + color);
    $("#mosaic").css("padding-right", "16px !important");

  }
  else {
    $("#mosaic").css("border", "6px solid " + color);
    $("#mosaic").css("padding-right","4px !important");
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
console.log(hexToRgb("#0c2238")); // → rgb(12, 34, 56)
console.log(hexToRgb("#fff"));    // → rgb(255, 255, 255)


/////////////////////////////////////////////////////////////////// R E A D Y
$(document).ready(function () {

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

  ////// H & L
  $(document).on("input", "#height", function(e) {
    //changeRadius(this.value);
    $("#height2").val(this.value);
  });

  $(document).on("input", "#height2", function(e) {
    //changeRadius(this.value);
    $("#height").val(this.value);
  });

  $(document).on("input", "#width", function(e) {
    //changeRadius(this.value);
    $("#width2").val(this.value);
  });

  $(document).on("input", "#width2", function(e) {
    //changeRadius(this.value);
    $("#width").val(this.value);
  });
/////

  $(document).on("change", "#frame", function(e) {
    changeFrame(this.checked);
  });

  $(document).on("change", "#square", function(e) {
    if ( $("#square")[0].checked && $("#width").val() != $("#height").val() )
                  changeSquare(this.checked);
  });

  $(document).on("change", "#width, #width2", function(e) {
    if ( $("#square")[0].checked ) {
      $("#height").val($("#width").val());
      $("#height2").val($("#width").val());
    }
    $("#submit").trigger("click");
  });

  $(document).on("change", "#height, #height2", function(e) {
    if ( $("#square")[0].checked ) {
      $("#width").val($("#height").val());
      $("#width2").val($("#height").val());
    }
    $("#submit").trigger("click");
  });
/////

  $(document).on("change", "#tileBorder", function(e) {
    generateMosaicGrid();
  });

  $('#mosaicForm').submit(function (event) {
      event.preventDefault();
      manualMode = false;
      generateMosaicGrid();
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
        window.location = "https://www.siouxlog.fr/MosaMatic2/";
  });

  $("#clearBtn").click(() => {
    $("#mosaicContainer").html("");
  });

  $("#square").trigger("click");
  $("#submit").trigger("click");
  $("#mosaic").css({border: "4px solid #444 !important"});

});
