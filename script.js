document.addEventListener('DOMContentLoaded', () => {
    // === ESTADO GLOBAL ===
    let currentScreen = 0;
    const maxScreens = 8;
    const userData = {
        name: '',
        surname: '',
        fullName: '',
        dob: '01/01/1900',
        phone: '',
        location: null,
        photo: null // base64 canvas
    };

    // === ELEMENTOS GLOBAIS ===
    const bgMusic = document.getElementById('bg-music');
    const volumeBtn = document.getElementById('volume-btn');

    let isMuted = false;
    volumeBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        volumeBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    // === SOM DE CLIQUE E TECLADO ===
    let audioCtx = null;
    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playClickSound() {
        if (isMuted) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Som de clique: rápido sweep de frequência para soar digital e levemente irritante
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.055);
        } catch (e) {
            console.error('Erro ao tocar som de clique:', e);
        }
    }

    function playTypeSound() {
        if (isMuted) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Som de digitação: beeps agudos e secos que irritam quando repetidos rapidamente
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.025);
            
            gain.gain.setValueAtTime(0.22, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.03);
        } catch (e) {
            console.error('Erro ao tocar som de digitação:', e);
        }
    }

    // Adiciona os ouvintes de eventos para todo o documento
    document.addEventListener('click', (e) => {
        // Ignora cliques no botão de volume para evitar feedback imediato antes de mutar
        if (e.target.id === 'volume-btn' || e.target.closest('#volume-btn')) {
            return;
        }
        playClickSound();
    });

    document.addEventListener('keydown', (e) => {
        // Ignora teclas de modificação comuns para não fazer barulho em atalhos
        const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (ignoredKeys.includes(e.key)) return;
        playTypeSound();
    });

    // Transição suave de áudio no loop
    bgMusic.addEventListener('timeupdate', () => {
        if (bgMusic.duration && bgMusic.currentTime >= bgMusic.duration - 0.3) {
            bgMusic.currentTime = 0;
            bgMusic.play();
        }
    });

    const screens = Array.from({ length: maxScreens + 3 }, (_, i) => document.getElementById(`screen-${i === 0 ? '0' : (i === 1 ? '0-lore' : (i === 2 ? '0-5' : (i === 3 ? '0-6' : (i === 12 ? '9' : i - 3))))}`)); // Correção do mapeamento de ids
    // Mapping:
    // idx 0 -> screen-0
    // idx 1 -> screen-0-lore
    // idx 2 -> screen-0-5
    // idx 3 -> screen-0-6
    // idx 4 -> screen-1
    // idx 5 -> screen-2
    // idx 6 -> screen-3
    // idx 7 -> screen-4
    // idx 8 -> screen-5
    // idx 9 -> screen-6
    // idx 10 -> screen-7
    // idx 11 -> screen-8
    // idx 12 -> screen-9

    const screenMap = ['screen-0', 'screen-0-lore', 'screen-0-5', 'screen-0-6', 'screen-1', 'screen-2', 'screen-3', 'screen-4', 'screen-5', 'screen-6', 'screen-7', 'screen-8', 'screen-9'];
    let currentStepIndex = 0;

    const topBar = document.getElementById('top-bar');

    // Manual
    const manualWindow = document.getElementById('manual-window');
    const btnToggleManual = document.getElementById('toggle-manual-btn');
    const btnCloseManual = document.getElementById('close-manual-btn');
    const manualText = document.getElementById('manual-text');

    const manualTexts = {
        'screen-1': '<h4>CAPÍTULO 1: SOBRE SEU NOME</h4><p>Para inserir seu nome, certifique-se de que as letras estejam na ordem correta. Lembre-se: seu nome começa com uma letra. Geralmente.</p><p>Sobre o sobrenome: caso não conste na lista, isso é seu problema, não nosso.</p><p>💡 DICA: Nomes com mais de 3 letras são aceitos. Possivelmente.</p><p>⚠️ NOTA: O botão avançar pode demorar. Tenha paciência. Ou não clique nele de novo.</p>',
        'screen-2': '<h4>CAPÍTULO 2: SOBRE DATAS</h4><p>O sistema aceita datas a partir de 1900. Anos anteriores à descoberta do Brasil podem não ser reconhecidos pelo algoritmo.</p><p>Para inserir sua data, basta clicar no botão "+" o número de vezes necessário. Simples assim.</p><p>💡 DICA: Se você nasceu em 1990, precisará clicar aproximadamente 90 vezes no ano.</p><p>⚠️ AVISO: Não temos responsabilidade sobre cãibras.</p>',
        'screen-3': '<h4>CAPÍTULO 3: TELECOMUNICAÇÃO FÔNICA</h4><p>Para numerais romanos, lembre-se: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.</p><p>Números como MCMLXXXVII são perfeitamente aceitáveis. Provavelmente.</p><p>💡 EXEMPLO: (11) 99999-9999 seria XI XCIX DCCCCXCIX-DCCCCXCIX. Boa sorte.</p><p>⚠️ NOTA: Os botões árabes estão bloqueados por motivos de elegância numérica.</p>',
        'screen-4': '<h4>CAPÍTULO 4: LOCALIZAÇÃO GEOGRÁFICA</h4><p>Posicione o PIN com precisão subatômica. Erros de mais de 3 quilômetros serão ignorados. Ou não.</p><p>O mapa mostra o planeta Terra. Caso more em outro planeta, selecione o local mais próximo.</p><p>💡 DICA: Zoom é seu amigo. Ou inimigo.</p>',
        'screen-5': '<h4>CAPÍTULO 5: RETRATO OFICIAL</h4><p>Seu retrato pixelado deve capturar sua essência espiritual corporativa.</p><p>💡 DICA: Um retrato com pelo menos 1 pixel preenchido é tecnicamente válido.</p><p>O Protocolo 7.432-B exige vestimenta formal. Como verificar isso em 20x20, ainda não sabemos.</p>',
        'screen-6': '<h4>CAPÍTULO 6: SELEÇÃO DE DEPARTAMENTO</h4><p>O questionário utiliza nosso algoritmo proprietário de 47 variáveis pseudocientíficas.</p><p>Os resultados são definitivos e irrevogáveis...</p>',
        'screen-7': '<h4>CAPÍTULO 7: TESTE DE HUMANIDADE</h4><p>Máquinas são boas de memória, humanos não. Ou era o contrário?</p>'
    };

    btnToggleManual.addEventListener('click', () => manualWindow.classList.toggle('hidden'));
    btnCloseManual.addEventListener('click', () => manualWindow.classList.add('hidden'));

    // Efeito de digitação (Typewriter)
    const typeWriterQueue = new Map();
    function applyTypewriter(element, text, speed = 25, onComplete) {
        if (typeWriterQueue.has(element)) {
            clearTimeout(typeWriterQueue.get(element));
        }
        element.innerHTML = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                const timer = setTimeout(type, speed);
                typeWriterQueue.set(element, timer);
            } else {
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }
        type();
    }

    // Controle da fala do Sr. Gathe
    let gatheTimer = null;
    let gatheTimerFinished = false;
    let gatheSpeechFinished = false;

    function startGatheTimer() {
        if (gatheTimer) {
            clearTimeout(gatheTimer);
        }
        gatheTimerFinished = false;
        const nextBtn = document.getElementById('btn-next-0-5');
        nextBtn.classList.add('btn-dark-disabled');
        
        gatheTimer = setTimeout(() => {
            gatheTimerFinished = true;
            nextBtn.classList.remove('btn-dark-disabled');
        }, 38000); // 38 segundos
    }

    function resetGatheSpeech() {
        gatheTimerFinished = false;
        gatheSpeechFinished = false;
        
        if (gatheTimer) {
            clearTimeout(gatheTimer);
        }
        
        const nextBtn = document.getElementById('btn-next-0-5');
        nextBtn.classList.add('btn-dark-disabled');

        const p = document.getElementById('dialog-gathe');
        const originalText = p.getAttribute('data-original-text') || p.innerText;
        if (!p.hasAttribute('data-original-text')) p.setAttribute('data-original-text', originalText);
        
        applyTypewriter(p, originalText, 310, () => {
            gatheSpeechFinished = true;
        });
        
        startGatheTimer();
    }

    function goToScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'hidden'));
        document.querySelectorAll('.screen').forEach(s => {
            if (s.id === screenId) {
                s.classList.add('active');
                // Aplica typewriter nos diálogos da tela ativa
                const dialogParagraphs = s.querySelectorAll('.dialog-bubble p:not(.character-name)');
                dialogParagraphs.forEach(p => {
                    const originalText = p.getAttribute('data-original-text') || p.innerText;
                    if (!p.hasAttribute('data-original-text')) p.setAttribute('data-original-text', originalText);
                    
                    if (p.id === 'dialog-gathe') {
                        applyTypewriter(p, originalText, 310, () => {
                            gatheSpeechFinished = true;
                        });
                        startGatheTimer();
                    } else {
                        applyTypewriter(p, originalText);
                    }
                });
            }
            else s.classList.add('hidden');
        });

        const newIndex = screenMap.indexOf(screenId);
        currentStepIndex = newIndex;

        // Mostrar top bar a partir da tela 1
        if (newIndex >= 4 && newIndex <= 10) {
            topBar.classList.remove('hidden');
            document.getElementById('game-container').classList.add('with-top-bar');
            const stepNumber = newIndex - 3; // Tela 1 = step 1
            document.querySelectorAll('.step-box').forEach((box, i) => {
                if (i < stepNumber) {
                    box.classList.add('active');
                } else {
                    box.classList.remove('active');
                }
            });

            // Atualizar manual
            if (manualTexts[screenId]) {
                manualText.innerHTML = manualTexts[screenId];
                manualWindow.classList.remove('hidden');
                setTimeout(() => manualWindow.classList.add('hidden'), 3000); // Mostra e esconde rápido pra irritar
            }

            // Atualizar placeholders de nome
            document.querySelectorAll('.player-name-placeholder').forEach(el => {
                el.innerText = userData.fullName || "Candidato";
            });
        } else {
            topBar.classList.add('hidden');
            document.getElementById('game-container').classList.remove('with-top-bar');
            manualWindow.classList.add('hidden');
        }
    }

    // === TELA 0 ===
    document.getElementById('btn-start').addEventListener('click', () => {
        bgMusic.play().catch(e => console.log('Audio autoplay blocked'));
        goToScreen('screen-0-lore');
    });

    // === TELA 0.LORE ===
    document.getElementById('btn-next-lore').addEventListener('click', () => {
        goToScreen('screen-0-5');
    });

    // === TELA 0.5 ===
    document.getElementById('btn-next-0-5').addEventListener('click', () => {
        if (!gatheTimerFinished || !gatheSpeechFinished) {
            resetGatheSpeech();
        } else {
            goToScreen('screen-0-6');
        }
    });

    document.getElementById('skip-gathe').addEventListener('click', () => {
        if (gatheTimer) {
            clearTimeout(gatheTimer);
        }
        goToScreen('screen-0-6');
    });

    // === TELA 0.6 ===
    document.getElementById('btn-next-0-6').addEventListener('click', () => goToScreen('screen-1'));

    // === TELA 1: IDENTIFICAÇÃO ===
    const inputName = document.getElementById('input-name');
    const selectSurname = document.getElementById('select-surname');
    const displayFullName = document.getElementById('display-full-name');
    const btnNext1 = document.getElementById('btn-next-1');
    const btnProgress1 = document.getElementById('btn-progress-1');
    let timer1 = null;

    function updateFullName() {
        const n = inputName.value.trim() || 'SemNome';
        const s = selectSurname.value;
        let final = n + ' ' + s;
        displayFullName.innerText = final;
        userData.fullName = final;
    }

    inputName.addEventListener('input', updateFullName);
    selectSurname.addEventListener('change', updateFullName);

    document.getElementById('btn-clear-1').addEventListener('click', () => {
        inputName.value = '';
        selectSurname.selectedIndex = 0;
        updateFullName();
    });

    btnNext1.addEventListener('click', () => {
        if (!userData.fullName) updateFullName();

        // Se clicar de novo, cancela, reseta e muda a fala da tartaruga
        if (timer1) {
            clearInterval(timer1);
            timer1 = null;
            btnProgress1.style.width = '0%';
            btnNext1.querySelector('.btn-text').innerText = "20s para Avançar";
            const tartDialog = document.getElementById('dialog-tartaruga-1');
            applyTypewriter(tartDialog, "Calma meu jovem... tudo aqui tem seu próprio... ritmo...");
            return;
        }

        let progress = 0;
        btnNext1.querySelector('.btn-text').innerText = "Aguarde...";
        timer1 = setInterval(() => {
            progress += 5; // 20 segundos = 100% (cada tick de 1s = 5%)
            btnProgress1.style.width = `${progress}%`;

            if (progress >= 100) {
                clearInterval(timer1);
                goToScreen('screen-2');
            }
        }, 1000);
    });

    // === TELA 2: DATA DE NASCIMENTO ===
    let day = 1, month = 1, year = 1900, clickCount = 0;
    const valDay = document.getElementById('val-day');
    const valMonth = document.getElementById('val-month');
    const valYear = document.getElementById('val-year');
    const displayDate = document.getElementById('date-display-text');
    const clickCounterText = document.getElementById('click-counter-text');

    function updateDateDisplay() {
        const d = String(day).padStart(2, '0');
        const m = String(month).padStart(2, '0');
        userData.dob = `${d}/${m}/${year}`;
        clickCount++;

        let emoji = "😅";
        if (clickCount > 20) emoji = "😓";
        if (clickCount > 40) emoji = "😤";
        if (clickCount > 60) emoji = "💀";

        clickCounterText.innerText = `Você clicou ${clickCount} vezes até agora. ${emoji} Continue...`;
    }

    document.getElementById('btn-add-day').addEventListener('click', () => {
        day = day >= 31 ? 1 : day + 1;
        valDay.innerText = String(day).padStart(2, '0');
        updateDateDisplay();
    });
    document.getElementById('btn-add-month').addEventListener('click', () => {
        month = month >= 12 ? 1 : month + 1;
        valMonth.innerText = String(month).padStart(2, '0');
        updateDateDisplay();
    });
    document.getElementById('btn-add-year').addEventListener('click', () => {
        year++;
        valYear.innerText = year;
        updateDateDisplay();
    });
    document.getElementById('btn-next-2').addEventListener('click', () => goToScreen('screen-3'));

    // === TELA 3: TELEFONE ROMANO ===
    const phoneDisplay = document.getElementById('phone-display-text');
    let phoneStr = '';

    document.querySelectorAll('.btn-roman').forEach(btn => {
        btn.addEventListener('click', () => {
            if (phoneStr === 'DIGITE SEU NÚMERO...') phoneStr = '';
            phoneStr += btn.innerText;
            phoneDisplay.innerText = phoneStr;
        });
    });
    document.getElementById('btn-roman-dash').addEventListener('click', () => {
        if (phoneStr !== 'DIGITE SEU NÚMERO...') { phoneStr += '-'; phoneDisplay.innerText = phoneStr; }
    });
    document.getElementById('btn-roman-space').addEventListener('click', () => {
        if (phoneStr !== 'DIGITE SEU NÚMERO...') { phoneStr += ' '; phoneDisplay.innerText = phoneStr; }
    });
    document.getElementById('btn-roman-del').addEventListener('click', () => {
        if (phoneStr !== 'DIGITE SEU NÚMERO...' && phoneStr.length > 0) {
            phoneStr = phoneStr.slice(0, -1);
            phoneDisplay.innerText = phoneStr.length === 0 ? 'DIGITE SEU NÚMERO...' : phoneStr;
        }
    });
    document.getElementById('btn-clear-3').addEventListener('click', () => {
        phoneStr = ''; phoneDisplay.innerText = 'DIGITE SEU NÚMERO...';
    });
    document.getElementById('btn-next-3').addEventListener('click', () => {
        userData.phone = phoneStr;
        goToScreen('screen-4');
        setTimeout(initMap, 500); // Inicializa o mapa depois da tela estar visível
    });

    // === TELA 4: MAPA (Leaflet) ===
    let map = null;
    let marker = null;
    function initMap() {
        if (map !== null) return;
        map = L.map('map-container', { zoomControl: false }).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Adicionando controles de zoom em posição péssima
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        map.on('click', function (e) {
            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng).addTo(map);
            userData.location = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
            document.getElementById('map-status').innerText = `📍 Selecionado: Lat ${e.latlng.lat.toFixed(4)}, Lng ${e.latlng.lng.toFixed(4)}`;
            document.getElementById('map-status').style.color = 'green';
        });
    }
    document.getElementById('btn-clear-4').addEventListener('click', () => {
        if (marker) map.removeLayer(marker);
        marker = null;
        document.getElementById('map-status').innerText = '⚠️ Nenhuma localização selecionada -- clique no mapa acima';
        document.getElementById('map-status').style.color = '';
    });
    document.getElementById('btn-next-4').addEventListener('click', () => {
        if (!marker) return alert("Clique no mapa com precisão subatômica primeiro!");
        goToScreen('screen-5');
    });

    // === TELA 5: PIXEL ART FRUSTRANTE ===
    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 15; // 300px / 20 = 15px por quadrado (grid 20x20)
    let isDrawing = false;
    let currentColor = '#000';
    let defaultColor = '#000';

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.getAttribute('data-color');
        });
    });

    document.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        drawRect(e);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) drawRect(e);
    });

    function drawRect(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / gridSize) * gridSize;
        const y = Math.floor((e.clientY - rect.top) / gridSize) * gridSize;
        ctx.fillStyle = currentColor;
        ctx.fillRect(x, y, gridSize, gridSize);
    }

    document.getElementById('btn-clear-5').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById('btn-next-5').addEventListener('click', () => {
        userData.photo = canvas.toDataURL();
        goToScreen('screen-6');
    });

    // === TELA 6: DEPARTAMENTO (QUIZ) ===
    const quizQuestions = [
        {
            q: "Você está em uma reunião que já durou três horas e alguém sugere \"pensar fora da caixa\". Qual é a sua reação imediata para demonstrar proatividade corporativa?",
            opts: ["Eu entro na caixa, fecho a tampa por dentro e tranco.", "Concordo fervorosamente, mas continuo pensando exclusivamente dentro de um círculo.", "Mordo o cabo do projetor para estabelecer dominância na sala.", "Pergunto qual é a metragem quadrada da caixa e se ela tem ar-condicionado."]
        },
        {
            q: "O bebedouro do escritório estourou e está jorrando café quente diretamente no teto. Como você soluciona esse incidente sem comprometer o fluxo de caixa?",
            opts: ["A culpa é da gravidade. A solução lógica é beber o teto.", "Não resolvo. O café no teto agora é uma nova feature inovadora do ambiente de trabalho.", "Abro meu guarda-chuva corporativo e agendo uma reunião para debater a umidade.", "A culpa é claramente do estagiário. A solução é contratar outro para limpar o teto."]
        },
        {
            q: "O prazo final para entregar o relatório de produtividade era ontem, mas você só foi avisado amanhã. Qual desculpa cronológica você utiliza para não ser demitido?",
            opts: ["\"O tempo é apenas uma construção social, assim como este relatório.\"", "\"Eu enviei o documento na linha do tempo onde a firma não existe.\"", "\"O fuso horário do meu relógio biológico está sincronizado com o de Júpiter.\"", "Culpo o botão de carregar que consumiu meu prazo."]
        },
        {
            q: "Um colega de equipe envia um e-mail urgente para você contendo apenas a letra \"H\" no assunto e o corpo em branco. Como você responde para manter a etiqueta profissional?",
            opts: ["Respondo com a letra \"I\" e aguardo o \"J\" para continuarmos o alfabeto produtivo.", "\"Agradeço o seu 'H', mas no momento o meu setor só tem orçamento para um 'W'.\"", "Encaminho o e-mail para a diretoria como prova incontestável de comunicação ágil.", "Reporto o colega ao RH por não usar algarismos romanos no assunto."]
        },
        {
            q: "Se o seu futuro departamento fosse um eletrodoméstico operando na voltagem errada e prestes a pifar, qual seria o seu papel fundamental na equipe?",
            opts: ["Tostar o pão do refeitório até ele virar carvão ativado para os gráficos de vendas.", "Girar a roupa suja da empresa tão rápido que a concorrência fica tonta.", "Fazer aquele barulho de geladeira velha de madrugada para manter todos acordados.", "Desligar sozinho exatamente no momento em que alguém mais precisar de mim."]
        }
    ];

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    quizQuestions.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'question-block';
        let htmlOpts = '';
        item.opts.forEach((opt, i) => {
            htmlOpts += `<label><input type="radio" name="q${idx}" value="${letters[i]}"> ${letters[i]}) ${opt}</label><br>`;
        });
        div.innerHTML = `
            <p><strong>${idx + 1}.</strong> ${item.q}</p>
            ${htmlOpts}
        `;
        quizContainer.appendChild(div);
    });

    document.getElementById('btn-next-6').addEventListener('click', () => {
        const btn = document.getElementById('btn-next-6');
        const status = document.getElementById('quiz-status');
        btn.disabled = true;
        status.classList.remove('hidden');

        let dots = 0;
        const thinking = setInterval(() => {
            dots = (dots + 1) % 4;
            status.innerText = "O Algoritmo está pensando" + ".".repeat(dots);
        }, 500);

        setTimeout(() => {
            clearInterval(thinking);
            status.innerText = "Algoritmo concluiu que não importa o que você escolheu. Avançando.";
            status.style.color = "black";
            setTimeout(() => {
                goToScreen('screen-7');
                initMemoryGame();
            }, 2000);
        }, 5000);
    });

    // === TELA 7: TESTE DE HUMANIDADE (MEMÓRIA) ===
    const memoryGrid = document.getElementById('memory-game');
    const terms = ['💼', '📈', '☕', '📊', '🗑️', '📅', '🖇️', '📉'];
    let deck = [...terms, ...terms];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let pairsFound = 0;

    function shuffle() {
        deck.sort(() => Math.random() - 0.5);
    }

    function initMemoryGame() {
        memoryGrid.innerHTML = '';
        shuffle();
        pairsFound = 0;
        document.getElementById('btn-next-7').classList.add('hidden');

        deck.forEach((term, idx) => {
            const card = document.createElement('div');
            card.classList.add('memory-card', 'hidden-card');
            card.dataset.term = term;
            card.innerText = term;

            card.addEventListener('click', () => {
                if (lockBoard) return;
                if (card === firstCard) return;

                card.classList.remove('hidden-card');

                if (!firstCard) {
                    firstCard = card;
                    return;
                }

                secondCard = card;
                lockBoard = true;

                if (firstCard.dataset.term === secondCard.dataset.term) {
                    // Match
                    firstCard.classList.add('matched');
                    secondCard.classList.add('matched');
                    resetBoard();
                    pairsFound++;
                    if (pairsFound === terms.length) {
                        document.getElementById('btn-next-7').classList.remove('hidden');
                    }
                } else {
                    // Miss -> Fecha após 800ms
                    setTimeout(() => {
                        firstCard.classList.add('hidden-card');
                        secondCard.classList.add('hidden-card');
                        resetBoard();
                    }, 800);
                }
            });
            memoryGrid.appendChild(card);
        });
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    document.getElementById('btn-next-7').addEventListener('click', () => {
        // Prepara Tela Final
        const departments = ["Submundo dos Bugs", "Departamento de Retrabalho Infinito", "Setor de Desculpas Corporativas", "Limpeza de Pixels", "Comitê do Café Suspeito"];
        const randDept = departments[Math.floor(Math.random() * departments.length)];

        document.getElementById('final-name').innerText = userData.fullName;
        document.getElementById('final-dob').innerText = userData.dob;
        document.getElementById('final-phone').innerText = userData.phone;
        document.getElementById('final-dept').innerText = randDept;
        if (userData.photo) {
            document.getElementById('final-photo').src = userData.photo;
        }
        goToScreen('screen-8');
    });

    // === TELA 8: FINAL ===
    document.getElementById('btn-final-presentation').addEventListener('click', () => {
        goToScreen('screen-9');
    });

    // === TELA 9: APRESENTAÇÃO ===
    document.getElementById('btn-back-home').addEventListener('click', () => {
        location.reload();
    });
});
