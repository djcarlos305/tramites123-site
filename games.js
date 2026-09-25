(() => {
  const root = document.getElementById("game"),
    lang = document.body.dataset.lang || "es",
    game = document.body.dataset.game,
    $ = (s) => root.querySelector(s);
  const es = lang === "es";
  const words = {
    new: es ? "Juego nuevo" : "New game",
    reset: es ? "Reiniciar" : "Reset",
    your: es ? "Tu turno" : "Your turn",
    cpu: es ? "Turno de la computadora" : "Computer’s turn",
    win: es ? "¡Ganaste!" : "You win!",
    lose: es ? "Ganó la computadora" : "Computer wins",
    draw: es ? "Empate" : "Draw",
    check: es ? "Comprobar" : "Check",
    solve: es ? "Mostrar solución" : "Show solution",
  };
  function shell(inner, status = "") {
    root.innerHTML = `<div class="game-bar"><div class="status" aria-live="polite">${status}</div><button class="btn light new-game">${words.new}</button></div>${inner}`;
    $(".new-game").onclick = () => init();
  }
  function checkers() {
    let board = Array(64).fill(null),
      turn = "red",
      selected = null,
      moves = [];
    for (let i = 0; i < 24; i++)
      if ((Math.floor(i / 8) + (i % 8)) % 2) board[i] = "black";
    for (let i = 40; i < 64; i++)
      if ((Math.floor(i / 8) + (i % 8)) % 2) board[i] = "red";
    shell(
      '<div class="board checkers-board"></div><p class="game-note">' +
        (es
          ? "Juego local para dos personas. Las capturas son obligatorias."
          : "Local two-player game. Captures are mandatory.") +
        "</p>",
      es ? "Turno: rojas" : "Turn: red",
    );
    const b = $(".checkers-board"),
      status = $(".status");
    function options(i, capturesOnly = false) {
      const p = board[i];
      if (!p) return [];
      const color = p.replace("K", ""),
        king = p.endsWith("K"),
        r = Math.floor(i / 8),
        c = i % 8,
        dirs = king
          ? [
              [-1, -1],
              [-1, 1],
              [1, -1],
              [1, 1],
            ]
          : color === "red"
            ? [
                [-1, -1],
                [-1, 1],
              ]
            : [
                [1, -1],
                [1, 1],
              ],
        out = [];
      for (const [dR, dC] of dirs) {
        let r1 = r + dR,
          c1 = c + dC;
        if (r1 < 0 || r1 > 7 || c1 < 0 || c1 > 7) continue;
        let n = r1 * 8 + c1;
        if (!board[n] && !capturesOnly) out.push({ to: n });
        else if (board[n] && board[n].replace("K", "") !== color) {
          let r2 = r + 2 * dR,
            c2 = c + 2 * dC;
          if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && !board[r2 * 8 + c2])
            out.push({ to: r2 * 8 + c2, cap: n });
        }
      }
      return out;
    }
    function anyCaps(color) {
      return board.some(
        (p, i) => p && p.replace("K", "") === color && options(i, true).length,
      );
    }
    function render() {
      b.innerHTML = "";
      board.forEach((p, i) => {
        const cell = document.createElement("button");
        cell.className =
          "checkers-cell " + ((Math.floor(i / 8) + (i % 8)) % 2 ? "dark" : "");
        if (i === selected) cell.classList.add("selected");
        if (moves.some((m) => m.to === i)) cell.classList.add("move");
        if (p) {
          const piece = document.createElement("span");
          piece.className =
            "piece " + p.replace("K", "") + (p.endsWith("K") ? " king" : "");
          cell.append(piece);
        }
        cell.onclick = () => click(i);
        b.append(cell);
      });
      const red = board.filter((p) => p?.startsWith("red")).length,
        black = board.filter((p) => p?.startsWith("black")).length;
      if (!red || !black)
        status.textContent = red
          ? es
            ? "¡Ganan las rojas!"
            : "Red wins!"
          : es
            ? "¡Ganan las negras!"
            : "Black wins!";
      else
        status.textContent =
          (es ? "Turno: " : "Turn: ") +
          (turn === "red" ? (es ? "rojas" : "red") : es ? "negras" : "black");
    }
    function click(i) {
      if (selected !== null) {
        const m = moves.find((x) => x.to === i);
        if (m) {
          let p = board[selected];
          board[i] = p;
          board[selected] = null;
          if (m.cap !== undefined) board[m.cap] = null;
          const row = Math.floor(i / 8);
          if ((p === "red" && row === 0) || (p === "black" && row === 7))
            board[i] = p + "K";
          if (m.cap !== undefined && options(i, true).length) {
            selected = i;
            moves = options(i, true);
          } else {
            selected = null;
            moves = [];
            turn = turn === "red" ? "black" : "red";
          }
          render();
          return;
        }
      }
      const p = board[i];
      if (p && p.replace("K", "") === turn) {
        selected = i;
        moves = options(i, anyCaps(turn));
        if (!moves.length) selected = null;
      }
      render();
    }
    render();
  }
  function connect() {
    let a = Array(42).fill(0),
      over = false;
    shell(
      '<div class="board connect-board"></div><p class="game-note">' +
        (es
          ? "Tú juegas con rojo. Toca una columna."
          : "You are red. Tap a column.") +
        "</p>",
      words.your,
    );
    const b = $(".connect-board"),
      s = $(".status");
    function win(v) {
      for (let r = 0; r < 6; r++)
        for (let c = 0; c < 7; c++)
          for (const [dr, dc] of [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
          ])
            if (
              [0, 1, 2, 3].every((k) => {
                let rr = r + dr * k,
                  cc = c + dc * k;
                return (
                  rr >= 0 && rr < 6 && cc >= 0 && cc < 7 && a[rr * 7 + cc] === v
                );
              })
            )
              return true;
      return false;
    }
    function drop(c, v) {
      for (let r = 5; r >= 0; r--)
        if (!a[r * 7 + c]) {
          a[r * 7 + c] = v;
          return true;
        }
      return false;
    }
    function render() {
      b.innerHTML = "";
      a.forEach((v, i) => {
        const x = document.createElement("button");
        x.className =
          "connect-cell " + (v === 1 ? "red" : v === 2 ? "yellow" : "");
        x.setAttribute(
          "aria-label",
          (es ? "Columna " : "Column ") + ((i % 7) + 1),
        );
        x.onclick = () => play(i % 7);
        b.append(x);
      });
    }
    function play(c) {
      if (over || !drop(c, 1)) return;
      render();
      if (win(1)) {
        s.textContent = words.win;
        over = true;
        return;
      }
      if (a.every(Boolean)) {
        s.textContent = words.draw;
        over = true;
        return;
      }
      s.textContent = words.cpu;
      setTimeout(() => {
        let choices = [0, 1, 2, 3, 4, 5, 6].filter((x) => a[x] === 0),
          pick = choices[Math.floor(Math.random() * choices.length)];
        for (const x of choices) {
          let copy = [...a];
          drop(x, 2);
          if (win(2)) {
            pick = x;
            a = copy;
            break;
          }
          a = copy;
        }
        drop(pick, 2);
        render();
        if (win(2)) {
          s.textContent = words.lose;
          over = true;
        } else s.textContent = words.your;
      }, 350);
    }
    render();
  }
  function ttt() {
    let a = Array(9).fill(""),
      over = false;
    shell(
      '<div class="board ttt-board"></div><p class="game-note">' +
        (es ? "Tú eres X." : "You are X.") +
        "</p>",
      words.your,
    );
    const b = $(".ttt-board"),
      s = $(".status"),
      wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
      winner = (x) => wins.some((w) => w.every((i) => a[i] === x));
    function render() {
      b.innerHTML = "";
      a.forEach((v, i) => {
        let x = document.createElement("button");
        x.className = "ttt-cell";
        x.textContent = v;
        x.onclick = () => play(i);
        b.append(x);
      });
    }
    function play(i) {
      if (over || a[i]) return;
      a[i] = "X";
      if (winner("X")) {
        over = true;
        s.textContent = words.win;
        render();
        return;
      }
      if (a.every(Boolean)) {
        over = true;
        s.textContent = words.draw;
        render();
        return;
      }
      let move = a.findIndex((_, i) => {
        if (a[i]) return false;
        a[i] = "O";
        let w = winner("O");
        a[i] = "";
        return w;
      });
      if (move < 0)
        move = a.findIndex((_, i) => {
          if (a[i]) return false;
          a[i] = "X";
          let w = winner("X");
          a[i] = "";
          return w;
        });
      if (move < 0) {
        let free = a.map((v, i) => (v ? "" : i)).filter((v) => v !== "");
        move = free[Math.floor(Math.random() * free.length)];
      }
      a[move] = "O";
      if (winner("O")) {
        over = true;
        s.textContent = words.lose;
      } else s.textContent = words.your;
      render();
    }
    render();
  }
  function sudoku() {
    const puzzles = [
      [
        "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
        "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
      ],
      [
        "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
        "245981376169273584837564219976125438513498627482736951391657842728349165654812793",
      ],
    ];
    let pick = puzzles[Math.floor(Math.random() * puzzles.length)],
      vals = pick[0].split("");
    shell(
      `<div class="board sudoku-board"></div><div class="game-bar" style="margin-top:18px"><button class="btn check">${words.check}</button><button class="btn secondary solve">${words.solve}</button></div><p class="game-note">${es ? "Completa cada fila, columna y cuadro 3×3 con los números del 1 al 9." : "Fill each row, column and 3×3 box with the numbers 1 through 9."}</p>`,
      es ? "Completa el tablero" : "Complete the board",
    );
    const b = $(".sudoku-board"),
      s = $(".status");
    vals.forEach((v, i) => {
      const input = document.createElement("input");
      input.className = "sudoku-cell" + (v !== "0" ? " given" : "");
      input.value = v === "0" ? "" : v;
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.disabled = v !== "0";
      input.oninput = () => {
        input.value = input.value.replace(/[^1-9]/g, "");
        vals[i] = input.value || "0";
        input.classList.remove("bad");
      };
      b.append(input);
    });
    $(".check").onclick = () => {
      let ok = true;
      [...b.children].forEach((x, i) => {
        if (x.value !== pick[1][i]) {
          x.classList.add("bad");
          ok = false;
        } else x.classList.remove("bad");
      });
      s.textContent = ok
        ? es
          ? "¡Perfecto! Sudoku completado."
          : "Perfect! Sudoku completed."
        : es
          ? "Hay casillas incorrectas o vacías."
          : "Some cells are incorrect or empty.";
    };
    $(".solve").onclick = () => {
      [...b.children].forEach((x, i) => (x.value = pick[1][i]));
      s.textContent = es ? "Solución mostrada." : "Solution shown.";
    };
  }
  function dominoes() {
    let set = [];
    for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) set.push([a, b]);
    set.sort(() => Math.random() - 0.5);
    let hand = set.splice(0, 7),
      cpu = set.splice(0, 7),
      chain = [],
      over = false;
    shell(
      `<div class="domino-table"><div class="domino-chain"></div><div class="domino-hand"></div></div><div class="game-bar" style="margin-top:18px"><button class="btn draw">${es ? "Robar ficha" : "Draw tile"}</button></div><p class="game-note">${es ? "Toca una ficha resaltada para jugarla." : "Tap a highlighted tile to play it."}</p>`,
      words.your,
    );
    const ch = $(".domino-chain"),
      hh = $(".domino-hand"),
      s = $(".status");
    const valid = (t) =>
      !chain.length || t.includes(chain[0][0]) || t.includes(chain.at(-1)[1]);
    function tile(t, playable = false) {
      let x = document.createElement("button");
      x.className = "domino" + (playable ? " playable" : "");
      x.innerHTML = `<span>${t[0]}</span><span>${t[1]}</span>`;
      return x;
    }
    function place(t) {
      if (!chain.length) {
        chain.push(t);
        return;
      }
      let left = chain[0][0],
        right = chain.at(-1)[1];
      if (t[0] === right) chain.push(t);
      else if (t[1] === right) chain.push([t[1], t[0]]);
      else if (t[1] === left) chain.unshift(t);
      else chain.unshift([t[1], t[0]]);
    }
    function render() {
      ch.innerHTML = "";
      hh.innerHTML = "";
      chain.forEach((t) => ch.append(tile(t)));
      hand.forEach((t, i) => {
        let x = tile(t, valid(t));
        x.onclick = () => play(i);
        hh.append(x);
      });
      s.textContent =
        (es ? "Tus fichas: " : "Your tiles: ") +
        hand.length +
        " · " +
        (es ? "Computadora: " : "Computer: ") +
        cpu.length +
        " · " +
        (es ? "Pozo: " : "Boneyard: ") +
        set.length;
    }
    function play(i) {
      if (over || !valid(hand[i])) return;
      place(hand.splice(i, 1)[0]);
      if (!hand.length) {
        s.textContent = words.win;
        over = true;
        render();
        return;
      }
      cpuTurn();
    }
    function cpuTurn() {
      let i = cpu.findIndex(valid);
      while (i < 0 && set.length) {
        cpu.push(set.pop());
        i = cpu.findIndex(valid);
      }
      if (i >= 0) place(cpu.splice(i, 1)[0]);
      if (!cpu.length) {
        over = true;
        render();
        s.textContent = words.lose;
        return;
      }
      render();
    }
    $(".draw").onclick = () => {
      if (set.length) hand.push(set.pop());
      else
        s.textContent = es
          ? "No quedan fichas en el pozo."
          : "No tiles remain in the boneyard.";
      render();
    };
    render();
  }
  function dailyWord() {
    const list = es
      ? ["SALSA", "PLAYA", "CASAS", "FUEGO", "RITMO", "CAFES", "AMIGO", "VIAJE", "MIAMI", "SABOR", "CALOR", "LUNES", "PAPEL", "AYUDA", "CANTO", "BAILE", "RADIO", "FOTOS", "NUBES", "VERDE", "DULCE", "RELOJ", "LIBRO", "MUNDO"]
      : ["SALSA", "BEACH", "HOUSE", "PARTY", "RHYME", "LATTE", "DANCE", "MUSIC", "MIAMI", "SMILE", "SUNNY", "PAPER", "RADIO", "PHOTO", "CLOUD", "GREEN", "SWEET", "CLOCK", "BOOKS", "WORLD", "WATER", "LIGHT", "OCEAN", "HEART"];
    const now = new Date(), day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const answer = list[day % list.length], max = 6;
    let row = 0, current = "", over = false;
    shell(`<div class="word-board" aria-label="${es ? "Tablero de palabra" : "Word board"}">${Array(max * 5).fill('<div class="word-cell"></div>').join("")}</div><div class="word-keyboard"></div><p class="game-note">${es ? "Adivina la palabra de cinco letras en seis intentos. Hay una palabra nueva cada día." : "Guess the five-letter word in six tries. A new word appears every day."}</p>`, es ? "Palabra del día" : "Daily word");
    const cells = [...root.querySelectorAll(".word-cell")], keyboard = $(".word-keyboard"), status = $(".status");
    const keys = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    function paint() { for (let i = 0; i < 5; i++) cells[row * 5 + i].textContent = current[i] || ""; }
    function score(guess) {
      const result = Array(5).fill("absent"), remaining = answer.split("");
      guess.split("").forEach((c, i) => { if (c === answer[i]) { result[i] = "correct"; remaining[i] = null; } });
      guess.split("").forEach((c, i) => { if (result[i] === "correct") return; const p = remaining.indexOf(c); if (p >= 0) { result[i] = "present"; remaining[p] = null; } });
      return result;
    }
    function press(key) {
      if (over) return;
      if (key === "⌫") { current = current.slice(0, -1); paint(); return; }
      if (key === "ENTER") {
        if (current.length !== 5) { status.textContent = es ? "Escribe cinco letras." : "Enter five letters."; return; }
        const result = score(current);
        result.forEach((state, i) => { cells[row * 5 + i].classList.add(state); const k = keyboard.querySelector(`[data-key="${current[i]}"]`); if (k && (state === "correct" || !k.classList.contains("correct"))) k.className = `word-key ${state}`; });
        if (current === answer) { status.textContent = es ? `¡Correcto en ${row + 1} intento${row ? "s" : ""}!` : `Solved in ${row + 1} ${row ? "tries" : "try"}!`; over = true; localStorage.setItem(`word-${lang}-${day}`, current); return; }
        row++; current = "";
        if (row === max) { status.textContent = (es ? "La palabra era: " : "The word was: ") + answer; over = true; } else status.textContent = es ? `Intento ${row + 1} de ${max}` : `Try ${row + 1} of ${max}`;
      } else if (/^[A-Z]$/.test(key) && current.length < 5) { current += key; paint(); }
    }
    keys.forEach((line, i) => { const rowEl = document.createElement("div"); rowEl.className = "word-key-row"; if (i === 2) rowEl.append(makeKey("ENTER", es ? "Enviar" : "Enter")); [...line].forEach(k => rowEl.append(makeKey(k, k))); if (i === 2) rowEl.append(makeKey("⌫", "⌫")); keyboard.append(rowEl); });
    function makeKey(value, label) { const b = document.createElement("button"); b.className = "word-key"; b.dataset.key = value; b.textContent = label; b.onclick = () => press(value); return b; }
    document.onkeydown = (e) => { if (e.key === "Enter") press("ENTER"); else if (e.key === "Backspace") press("⌫"); else press(e.key.toUpperCase()); };
  }
  function trivia() {
    const bank = es ? [
      ["¿En qué país nació la salsa como movimiento musical moderno?", ["Cuba", "Puerto Rico", "Estados Unidos", "Colombia"], 2],
      ["¿Cuál es la capital de República Dominicana?", ["Santiago", "Santo Domingo", "Punta Cana", "La Romana"], 1],
      ["¿Qué instrumento lleva dos pequeños tambores unidos?", ["Bongó", "Maracas", "Güiro", "Clave"], 0],
      ["¿En qué ciudad está la Calle Ocho?", ["Orlando", "Tampa", "Miami", "Nueva York"], 2],
      ["¿Cuál país tiene forma larga y estrecha junto al Pacífico?", ["Chile", "Perú", "Panamá", "Uruguay"], 0],
      ["¿Qué baile nació en República Dominicana?", ["Tango", "Merengue", "Samba", "Flamenco"], 1],
      ["¿Qué grano se usa para preparar el café?", ["Cacao", "Maíz", "Cafeto", "Trigo"], 2],
      ["¿Cuál es la moneda de México?", ["Peso", "Sol", "Quetzal", "Real"], 0],
      ["¿Qué mar está al sur de Cuba?", ["Mediterráneo", "Caribe", "Báltico", "Rojo"], 1],
      ["¿Cuántas cuerdas tiene normalmente una guitarra?", ["Cuatro", "Cinco", "Seis", "Ocho"], 2]
    ] : [
      ["In which U.S. city did modern salsa flourish?", ["Miami", "New York", "Los Angeles", "Chicago"], 1],
      ["What is the capital of the Dominican Republic?", ["Santiago", "Santo Domingo", "Punta Cana", "La Romana"], 1],
      ["Which instrument consists of two small joined drums?", ["Bongos", "Maracas", "Güiro", "Claves"], 0],
      ["In which city is Calle Ocho?", ["Orlando", "Tampa", "Miami", "New York"], 2],
      ["Which country is long and narrow along the Pacific?", ["Chile", "Peru", "Panama", "Uruguay"], 0],
      ["Which dance originated in the Dominican Republic?", ["Tango", "Merengue", "Samba", "Flamenco"], 1],
      ["Which plant produces coffee beans?", ["Cacao", "Corn", "Coffee plant", "Wheat"], 2],
      ["What is Mexico’s currency?", ["Peso", "Sol", "Quetzal", "Real"], 0],
      ["Which sea lies south of Cuba?", ["Mediterranean", "Caribbean", "Baltic", "Red Sea"], 1],
      ["How many strings does a standard guitar have?", ["Four", "Five", "Six", "Eight"], 2]
    ];
    let order = [...bank].sort(() => Math.random() - .5), q = 0, score = 0, locked = false;
    shell('<div class="trivia-progress"></div><div class="trivia-card"><h2 class="trivia-question"></h2><div class="trivia-options"></div></div>', es ? "Pon a prueba lo que sabes" : "Test what you know");
    const progress = $(".trivia-progress"), question = $(".trivia-question"), options = $(".trivia-options"), status = $(".status");
    function show() { locked = false; progress.textContent = `${es ? "Pregunta" : "Question"} ${q + 1} / ${order.length} · ${es ? "Puntos" : "Score"}: ${score}`; question.textContent = order[q][0]; options.innerHTML = ""; order[q][1].forEach((label, i) => { const b = document.createElement("button"); b.className = "trivia-option"; b.textContent = label; b.onclick = () => answer(i, b); options.append(b); }); }
    function answer(i, button) { if (locked) return; locked = true; const correct = order[q][2]; [...options.children].forEach((b, n) => { b.disabled = true; if (n === correct) b.classList.add("correct"); }); if (i === correct) { score++; status.textContent = es ? "¡Correcto!" : "Correct!"; } else { button.classList.add("wrong"); status.textContent = es ? "No era esa." : "Not that one."; } setTimeout(() => { q++; if (q < order.length) show(); else { question.textContent = `${es ? "Resultado final" : "Final score"}: ${score} / ${order.length}`; options.innerHTML = `<button class="btn play-again">${es ? "Jugar otra vez" : "Play again"}</button>`; $(".play-again").onclick = () => init(); progress.textContent = score >= 8 ? (es ? "¡Excelente!" : "Excellent!") : score >= 5 ? (es ? "¡Buen trabajo!" : "Good job!") : (es ? "Sigue practicando" : "Keep practicing"); } }, 850); }
    show();
  }
  function wordSearch() {
    const sets = es ? [["SALSA", "RITMO", "CONGA", "CLAVE", "BAILE", "CANTO"], ["MIAMI", "PLAYA", "CALOR", "PALMA", "ARENA", "SOL"]] : [["SALSA", "RHYTHM", "CONGA", "CLAVE", "DANCE", "MUSIC"], ["MIAMI", "BEACH", "SUNNY", "PALMS", "OCEAN", "SAND"]];
    const size = 10, chosen = sets[Math.floor(Math.random() * sets.length)], grid = Array.from({length:size}, () => Array(size).fill("")), placed = [];
    const dirs = [[0,1],[1,0],[1,1],[-1,1]];
    chosen.forEach(word => { for (let tries=0; tries<300; tries++) { const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)], r=Math.floor(Math.random()*size), c=Math.floor(Math.random()*size), er=r+dr*(word.length-1), ec=c+dc*(word.length-1); if(er<0||er>=size||ec<0||ec>=size) continue; let ok=true; for(let i=0;i<word.length;i++){const x=grid[r+dr*i][c+dc*i]; if(x&&x!==word[i]) ok=false;} if(!ok) continue; for(let i=0;i<word.length;i++) grid[r+dr*i][c+dc*i]=word[i]; placed.push({word,start:r*size+c,end:er*size+ec,cells:Array.from({length:word.length},(_,i)=>(r+dr*i)*size+c+dc*i)}); break; } });
    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; grid.forEach(row=>row.forEach((v,i)=>{if(!v)row[i]=letters[Math.floor(Math.random()*letters.length)]}));
    let first=null, found=new Set(); shell(`<div class="search-layout"><div class="search-board">${grid.flat().map((x,i)=>`<button data-cell="${i}">${x}</button>`).join("")}</div><div class="search-words">${placed.map(x=>`<span data-word="${x.word}">${x.word}</span>`).join("")}</div></div><p class="game-note">${es ? "Toca la primera y la última letra de una palabra. Pueden estar en horizontal, vertical o diagonal." : "Tap the first and last letter of a word. Words may run horizontally, vertically or diagonally."}</p>`, es ? "Encuentra las 6 palabras" : "Find all 6 words");
    const buttons=[...root.querySelectorAll(".search-board button")], status=$(".status");
    buttons.forEach(b=>b.onclick=()=>{const n=Number(b.dataset.cell); if(first===null){first=n;b.classList.add("selected");status.textContent=es?"Ahora toca la última letra.":"Now tap the last letter.";return;} buttons[first].classList.remove("selected"); const hit=placed.find(x=>!found.has(x.word)&&((x.start===first&&x.end===n)||(x.end===first&&x.start===n))); first=null; if(!hit){status.textContent=es?"Esa no es una palabra. Intenta otra vez.":"That is not a word. Try again.";return;} found.add(hit.word); hit.cells.forEach(i=>buttons[i].classList.add("found")); root.querySelector(`[data-word="${hit.word}"]`).classList.add("found"); status.textContent=found.size===placed.length?(es?"¡Encontraste todas las palabras!":"You found every word!"):`${found.size} / ${placed.length}`;});
  }
  function init() {
    (
      ({ dailyword: dailyWord, trivia, wordsearch: wordSearch, sudoku, tictactoe: ttt })[game] || ttt
    )();
  }
  init();
})();
