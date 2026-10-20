const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = document.querySelector(".answer-options");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const resultContainer = document.querySelector(".result-container");

//Testin vaiheen muuttujat
let quizCategory = "9-8kup";
let numberOfQuestions = 0; //Kysymysten määrä, määritellään dynaamisesti
let currentQuestionIndex = 0;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswerCount = 0;
let questions = questions_sk; // käytettävä kysymyslista, oletuksena Suomi-Korea



// Näytä testin tulokset ja piilota testi
const showQuizResult = () => {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";

    // Vaihtuva indikaattori
    let feedback;
    const scorePercent = (correctAnswerCount / numberOfQuestions) * 100;

    if (scorePercent === 100) {
        feedback = "Täydellistä! Sabumnim kyogne! 👑";
    } else if (scorePercent >= 80) {
        feedback = "Loistava suoritus! Tekniikka jo hallussa! 🔥";
    } else if (scorePercent >= 60) {
        feedback = "Hyvä meininki, jatka samaan malliin! 🚀";
    } else if (scorePercent >= 40) {
        feedback = "Alkaa sujua! Nyt vain treeniä kehiin! 💪";
    } else if (scorePercent >= 20) {
        feedback = "Tästä on hyvä jatkaa eteenpäin! 🛠️";
    } else {
        feedback = "Mestaritkin aloittavat jostain! 🌱";
    }

    const resultText = `<h2>Tuloksesi: ${correctAnswerCount} / ${numberOfQuestions}</h2><br>${feedback}`;
    document.querySelector(".result-message").innerHTML = resultText;
}



// Haetaan satunnainen kysymys valitusta kategoriasta
const getRandomQuestion = () => {
    const categoryQuestions = questions.find(cat => cat.category.toLowerCase() === quizCategory.toLowerCase()).questions || [];
    
    // Päivitä dynaaminen kysymysten määrä
    numberOfQuestions = categoryQuestions.length;

    // Näytä tulokset, jos kaikki kysymykset on käytetty
    if (questionsIndexHistory.length >= numberOfQuestions) {
        return showQuizResult();
    }

    // Rajaa pois käytetyt kysymykset ja valitsee satunnaisesti uuden seuraavaksi
    const availableQuestion = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
    const randomQuestion = availableQuestion[Math.floor(Math.random() * availableQuestion.length)];
    
    questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
    return randomQuestion;
}

// Sekoittaa taulukon ja palauttaa uuden taulukon sekä indeksin, jossa oikea vastaus on
const shuffleOptions = (options, correctIndex) => {
    const indexedOptions = options.map((opt, idx) => ({ opt, originalIndex: idx }));
    for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }
    const shuffledOptions = indexedOptions.map(item => item.opt);
    const newCorrectIndex = indexedOptions.findIndex(item => item.originalIndex === correctIndex);
    return { shuffledOptions, newCorrectIndex };
};

//Korostaa oikean vastauksen ja lisää ikonin
const highlightCorrectAnswer = () => {
    const correctOption = answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer]
    correctOption.classList.add("correct");
    const iconHTML = `<span class="material-symbols-rounded">check_circle</span>`;
    correctOption.insertAdjacentHTML("beforeend", iconHTML);
}

//Käsittelee käyttäjän vastaus valikoimaa
const handleAnswer = (option, answerIndex) => {
    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    option.classList.add(isCorrect ? 'correct' : 'incorrect');
    !isCorrect ? highlightCorrectAnswer() : correctAnswerCount++;

    //Lisätään ikoni vastauksen oikeellisuudesta riippuen
    const iconHTML = `<span class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</span>`;
    option.insertAdjacentHTML("beforeend", iconHTML);

    //Poistaa käytöstä muut vastausmahdollisuudet, kun yksi vastaus on valittu
    answerOptions.querySelectorAll(".answer-option").forEach(option => option.style.pointerEvents = 'none');

    nextQuestionBtn.style.visibility = "visible";
}



// Renderöi nykyinen kysymys ja sen vaihtoehdot
const renderQuestion = () => {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) return;

    // Päivittää UI:n
    answerOptions.innerHTML = "";
    nextQuestionBtn.style.visibility = "hidden";
    document.querySelector(".question-text").textContent = currentQuestion.question;

    // Päivitetään kysymysstatus
    questionStatus.innerHTML = `<b>Kysymys ${currentQuestionIndex + 1} / ${numberOfQuestions}</b>`;

    const { shuffledOptions, newCorrectIndex } = shuffleOptions(currentQuestion.options, currentQuestion.correctAnswer);
    currentQuestion.correctAnswer = newCorrectIndex; // Päivitetään oikea vastaus uuteen sijaintiin
    
    shuffledOptions.forEach((option, index) => {
        const li = document.createElement("li");
        li.classList.add("answer-option");
        li.textContent = option;
        answerOptions.appendChild(li);
        li.addEventListener("click", () => handleAnswer(li, index));
    });

    // Päivitä laskuri
    currentQuestionIndex++;
}

// Käynnistä seuraava kysymys
nextQuestionBtn.addEventListener("click", renderQuestion);

//Aloita testi ja renderöi satunnaiset kysymykset
const startQuiz = () => {
    configContainer.style.display = "none";
    quizContainer.style.display = "block";

    //Päivitä valittu kategoria
    quizCategory = configContainer.querySelector(".category-option.active").textContent;

    renderQuestion();
}

//Korosta valittu vaihtoehto klikkauksella
document.querySelectorAll(".category-option, .language-option").forEach(option => {
    option.addEventListener("click", () => {
        option.parentNode.querySelector(".active").classList.remove("active");
        option.classList.add("active");

        //Vaihda käytettävää js-tiedostoa valinnan mukaan
        const selectedLang = option.textContent.trim();

        if (selectedLang === "Korea-Suomi") {
            questions = questions_ks;
        } else {
            questions = questions_sk;
        }
    });
})

//Resetoi testi
const resetQuiz = () => {
    location.reload(); // Lataa sivu uudelleen
}

nextQuestionBtn.addEventListener("click", renderQuestion);
document.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);
document.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
document.querySelector(".restart-btn").addEventListener("click", resetQuiz);
