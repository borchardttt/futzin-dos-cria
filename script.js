const players = [];

function addPlayer() {
	const input = document.getElementById("playerInput");
	const isGK = document.getElementById("isGoalkeeper").checked;
	const name = input.value.trim();

	if (name && !players.some(p => p.name === name)) {
		players.push({ name, isGoalkeeper: isGK });
		input.value = "";
		document.getElementById("isGoalkeeper").checked = false;
		updatePlayerList();
	}
}

function updatePlayerList() {
	const list = document.getElementById("playerList");
	const count = document.getElementById("playerCount");

	list.innerHTML = players
		.map((p, i) => {
			const initials = p.name
				.split(' ')
				.map(n => n[0]?.toUpperCase())
				.slice(0, 2)
				.join('');

			const bgColor = p.isGoalkeeper
				? 'bg-yellow-100 text-yellow-800'
				: 'bg-blue-100 text-blue-800';

			const cardBg = p.isGoalkeeper
				? 'bg-yellow-50/10 border-yellow-400/40'
				: 'bg-white/5 border-white/10';

			return `
			<li class="flex items-center gap-3 p-3 rounded-lg border ${cardBg} transition transform hover:scale-[1.015] hover:shadow-md animate-fade-in">
				<div class="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${bgColor} ring-2 ring-white/10 shadow-sm">
					${initials}
				</div>
				<div class="flex-1 truncate">
					<span class="font-medium">${p.name}</span>
					${p.isGoalkeeper ? '<span class="ml-1">🧤</span>' : ''}
				</div>
				<button
					onclick="removePlayer(${i})"
					class="text-red-400 hover:text-red-600 font-bold text-base transition"
					title="Remover jogador"
				>
					×
				</button>
			</li>`;
		})
		.join("");

	const total = players.length;
	const timesPossiveis = Math.floor(total / 5);
	count.textContent = timesPossiveis < 2 ? `${total}/10` : `${total} jogadores`;
}



function removePlayer(index) {
	players.splice(index, 1);
	updatePlayerList();
}

function shuffleArray(arr) {
	return arr
		.map((a) => [Math.random(), a])
		.sort((a, b) => a[0] - b[0])
		.map((a) => a[1]);
}
function sortTeams() {
	const resultDiv = document.getElementById("teamsResult");
	resultDiv.innerHTML = "";

	if (players.length < 10) {
		resultDiv.innerHTML = `<p class="text-red-400">Adicione pelo menos 10 jogadores para montar os times.</p>`;
		return;
	}

	const shuffled = shuffleArray([...players]);

	const goleiros = shuffled.filter(p => p.isGoalkeeper);
	const naoGoleiros = shuffled.filter(p => !p.isGoalkeeper);

	if (goleiros.length < 2) {
		resultDiv.innerHTML = `<p class="text-yellow-400">É necessário pelo menos 2 goleiros para formar os times.</p>`;
		return;
	}

	const teams = [[], [], []];
	const bench = [];

	goleiros.slice(0, 3).forEach((gk, i) => {
		teams[i].push(gk);
	});

	const restantes = [...naoGoleiros, ...goleiros.slice(3)];

	let teamIndex = 0;
	for (const player of restantes) {
		while (teamIndex < teams.length && teams[teamIndex].length >= 5) {
			teamIndex++;
		}
		if (teamIndex < teams.length) {
			teams[teamIndex].push(player);
		} else {
			bench.push(player);
		}
	}

	const createTeamHTML = (name, members, color) => {
		return `
    <div class="rounded-xl border border-white/10 p-4 bg-white/5 animate-fade-in">
      <h3 class="text-xl font-semibold mb-3 text-${color}-400">${name}</h3>
      <ul class="space-y-2">
        ${members
				.map(m => {
					const initials = m.name
						.split(' ')
						.map(n => n[0]?.toUpperCase())
						.slice(0, 2)
						.join('');
					const bgColor = m.isGoalkeeper ? 'bg-yellow-300 text-yellow-900' : 'bg-blue-300 text-blue-900';
					return `
              <li class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
							<div class="w-8 h-8 flex items-center justify-center rounded-full font-bold ${bgColor} ring-1 ring-white/20">
                  ${initials}
                </div>
                <span class="font-medium flex-1 break-words whitespace-normal">
                  ${m.name}${m.isGoalkeeper ? ' 🧤' : ''}
                </span>
              </li>`;
				})
				.join('')}
      </ul>
    </div>
  `;
	};


	const coresDisponiveis = ["red", "blue", "green", "orange", "yellow", "purple", "pink", "cyan", "lime", "teal"];
	const cores = shuffleArray([...coresDisponiveis]).slice(0, teams.length);

	const teamGrid = document.createElement("div");
	teamGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

	let bancoVisivel = null;

	teams.forEach((team, i) => {
		if (team.length === 5) {
			const color = cores[i];
			const teamHTML = createTeamHTML(`Time ${i + 1}`, team, color);
			const wrapper = document.createElement("div");
			wrapper.innerHTML = teamHTML;
			teamGrid.appendChild(wrapper.firstElementChild);
		} else {
			bench.push(...team);
		}
	});

	if (bench.length > 0) {
		const bancoHTML = createTeamHTML("Banco de Reserva", bench, "gray");
		const bancoWrapper = document.createElement("div");
		bancoWrapper.innerHTML = bancoHTML;
		teamGrid.appendChild(bancoWrapper.firstElementChild);
	}

	resultDiv.appendChild(teamGrid);
}


function exportToImage() {
	const container = document.getElementById("teamsResult");

	if (container.innerHTML.trim() === "") {
		alert("Você precisa sortear os times antes de exportar!");
		return;
	}

	const clone = container.cloneNode(true);
	clone.style.position = "static";
	clone.style.display = "block";
	clone.style.minHeight = "100vh";
	clone.style.left = "-9999px";
	clone.style.top = "0";
	clone.style.backgroundColor = "#1f2937";
	clone.style.padding = "1.5rem";
	document.body.appendChild(clone);

	html2canvas(clone, {
		backgroundColor: "#1f2937",
		scale: 2,
		useCORS: true
	}).then((canvas) => {
		const link = document.createElement("a");
		link.download = `resenha-dos-crias-${Date.now()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
		document.body.removeChild(clone);
	});
}

