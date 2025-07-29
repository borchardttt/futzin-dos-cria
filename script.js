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
	list.innerHTML = players
		.map((p, i) => `
			<li class="flex items-center justify-between">
				<span>${p.name} ${p.isGoalkeeper ? '🧤' : ''}</span>
				<button
					class="text-red-400 hover:text-red-600 text-sm ml-2"
					onclick="removePlayer(${i})"
					title="Remover jogador"
				>
					❌
				</button>
			</li>
		`)
		.join("");
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


	const createTeamHTML = (name, members, color) => `
    <div class="bg-${color}-800 p-4 rounded">
      <h3 class="text-xl font-bold mb-2">${name}</h3>
      <ul class="list-disc pl-5 text-sm">
        ${members.map((m) => `<li>${m.name} ${m.isGoalkeeper ? '🧤' : ''}</li>`).join("")}
      </ul>
    </div>`;

	const cores = ["red", "blue", "green"];

	teams.forEach((team, i) => {
		if (team.length === 5) {
			resultDiv.innerHTML += createTeamHTML(`Time ${i + 1}`, team, cores[i]);
		} else {
			bench.push(...team);
		}
	});

	if (bench.length > 0) {
		resultDiv.innerHTML += createTeamHTML("Banco de Reserva", bench, "gray");
	}
}

function exportToImage() {
	const container = document.getElementById("teamsResult");

	if (container.innerHTML.trim() === "") {
		alert("Você precisa sortear os times antes de exportar!");
		return;
	}

	html2canvas(container, {
		backgroundColor: "#1f2937",
		scale: 2
	}).then((canvas) => {
		const link = document.createElement("a");
		link.download = `resenha-dos-crias-${Date.now()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
	});
}
