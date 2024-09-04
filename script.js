let top10 = [];
let classementGlobal = {};  // Utilisé pour garder trace du classement global
let tousLesResultats = [];  // Conserve tous les résultats saisis

// Fonction pour générer une valeur unique
function genererValeurDistincte() {
    let digits = [];
    let valeur = 0;

    while (digits.length < 6) {
        let digit = Math.floor(Math.random() * 10);
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }

    valeur = digits[0] * 100000 + digits[1] * 10000 + digits[2] * 1000 + digits[3] * 100 + digits[4] * 10 + digits[5];
    
    return valeur;
}

// Fonction pour formater les nombres
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Fonction pour générer une valeur pour un prénom
function genererValeur() {
    const prenom = document.getElementById('prenomInput').value;
    if (prenom.trim() === '') {
        return;
    }

    const valeur = genererValeurDistincte();
    const resultObj = { prenom, valeur };
    tousLesResultats.push(resultObj);
    
    // Mettre à jour le classement global
    if (classementGlobal[prenom]) {
        classementGlobal[prenom] = Math.max(classementGlobal[prenom], valeur);
    } else {
        classementGlobal[prenom] = valeur;
    }

    // Mettre à jour le tableau top10
    top10 = Object.entries(classementGlobal).map(([prenom, valeur]) => ({ prenom, valeur }));
    top10.sort((a, b) => b.valeur - a.valeur);

    if (top10.length > 10) {
        top10 = top10.slice(0, 10);
    }

    mettreAJourTableau(resultObj);

    // Vider la zone de saisie après la validation
    document.getElementById('prenomInput').value = '';
    
    // Afficher le classement général si le top 10 est plein
    if (top10.length === 10) {
        document.getElementById('afficherClassementGeneral').checked = true;
        afficherClassementGeneral(); // Assurez-vous que le tableau général est affiché
    }
}

// Fonction pour mettre à jour le tableau
function mettreAJourTableau(resultObj) {
    const tableBody = document.getElementById('top10Table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Calculer le classement global
    const classementGlobalArray = Object.entries(classementGlobal).map(([prenom, valeur]) => ({ prenom, valeur }));
    classementGlobalArray.sort((a, b) => b.valeur - a.valeur);

    let classement = classementGlobalArray.findIndex(item => item.prenom === resultObj.prenom && item.valeur === resultObj.valeur) + 1;
    if (classement === 0) {
        classement = classementGlobalArray.length + 1; // Si le prénom n'est pas dans le top 10, afficher un classement inférieur au nombre total d'entrées
    }
    
    const resultatElement = document.getElementById('resultat');
    resultatElement.innerHTML = `Le prénom "<strong>${resultObj.prenom}</strong>" vaut <strong>${formatNumber(resultObj.valeur)}€</strong> et est classé n°<strong>${classement}</strong>`;

    top10.forEach((item, index) => {
        const row = document.createElement('tr');
        const classementCell = document.createElement('td');
        const prenomCell = document.createElement('td');
        const valeurCell = document.createElement('td');

        let medal = '';
        if (index === 0) {
            medal = '🥇';
        } else if (index === 1) {
            medal = '🥈';
        } else if (index === 2) {
            medal = '🥉';
        }

        classementCell.textContent = `${index + 1}`;
        prenomCell.textContent = `${medal} ${item.prenom}`;
        valeurCell.textContent = formatNumber(item.valeur);

        row.appendChild(classementCell);
        row.appendChild(prenomCell);
        row.appendChild(valeurCell);
        tableBody.appendChild(row);
    });
}

// Fonction pour afficher ou masquer le classement général
function afficherClassementGeneral() {
    const generalTable = document.getElementById('classementGeneralTable');
    const showGeneralCheckbox = document.getElementById('afficherClassementGeneral');
    
    if (showGeneralCheckbox.checked) {
        const tableBody = generalTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        const classementGlobalArray = Object.entries(classementGlobal).map(([prenom, valeur]) => ({ prenom, valeur }));
        classementGlobalArray.sort((a, b) => b.valeur - a.valeur);

        classementGlobalArray.forEach((item, index) => {
            const row = document.createElement('tr');
            const classementCell = document.createElement('td');
            const prenomCell = document.createElement('td');
            const valeurCell = document.createElement('td');

            classementCell.textContent = `${index + 1}`;
            prenomCell.textContent = item.prenom;
            valeurCell.textContent = formatNumber(item.valeur);

            row.appendChild(classementCell);
            row.appendChild(prenomCell);
            row.appendChild(valeurCell);
            tableBody.appendChild(row);
        });
        
        generalTable.style.display = 'table'; // Afficher le tableau général
    } else {
        generalTable.style.display = 'none'; // Masquer le tableau général
    }
}

// Fonction pour détecter l'entrée
function detecterEntree(event) {
    if (event.key === 'Enter') {
        genererValeur();
    }
}

// Fonction pour exporter le Top 10
function exporterTop10() {
    let csvContent = "Classement,Prénom,Valeur (€)\n";
    top10.forEach((item, index) => {
        csvContent += `${index + 1},${item.prenom},${formatNumber(item.valeur)}\n`;
    });
    const dateTime = getFormattedDateTime();
    const nomFichier = `${dateTime}_top10_${top10[0]?.prenom || 'data'}.csv`;
    telechargerFichier(csvContent, nomFichier);
}

// Fonction pour exporter tous les résultats
function exporterTousLesResultats() {
    let csvContent = "Classement,Prénom,Valeur (€)\n";
    tousLesResultats.forEach((item, index) => {
        csvContent += `${index + 1},${item.prenom},${formatNumber(item.valeur)}\n`;
    });
    const dateTime = getFormattedDateTime();
    const nomFichier = `${dateTime}_classement-general.csv`;
    telechargerFichier(csvContent, nomFichier);
}

// Fonction pour obtenir la date et l'heure formatées
function getFormattedDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${date}_${time}`;
}

// Fonction pour télécharger un fichier
function telechargerFichier(contenu, nomFichier) {
    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nomFichier);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Ajouter un gestionnaire d'événements pour détecter la touche "Enter"
document.getElementById('prenomInput').addEventListener('keypress', detecterEntree);

// Ajouter un gestionnaire d'événements pour la case à cocher du classement général
document.getElementById('afficherClassementGeneral').addEventListener('change', afficherClassementGeneral);

// Initialiser l'état du tableau général lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que le tableau général est masqué par défaut
    document.getElementById('classementGeneralTable').style.display = 'none';
});
