"use strict";

let containerElem = document.createElement('div');
containerElem.classList.add('container');

///////////////////// ЧТО КАСАЕТСЯ ИГР СО ВРЕМЕНЕМ ////////////////////////////////////



function getZero(value) { // функция проверки на отсутствие нуля перед значением времени и даты (форме нужен ноль перед значениями типа 07:09 и т.д.)
    if (value < 10) {
        value = '0' + value;
    }
    return value;
}

let curDate = new Date(); // получаем текущие дату и время (не таймстамп!!!)

function date_time(curDate) { //   
    let day = getZero(curDate.getDate());
    let month = getZero(curDate.getMonth() + 1);
    let year = curDate.getFullYear();
    let hours = getZero(curDate.getHours());
    let minutes = getZero(curDate.getMinutes());
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

document.getElementById("addDate").value = date_time(curDate); // пихаем в форму значения даты и времени из функции

let myTimestamp = Date.parse(document.getElementById("addDate").value); // получаем таймстамп  из вышеприведённой формы 

let myTime = new Date(myTimestamp); // приводим этот таймстамп к человеческому формату



///////////////////// ДОБАВЛЯЕМ ДЕДЛАЙН //////////////////////////////////////



let idSetter;
if (localStorage.length == 0) { // если локалсторож пуст, то  создаём хранилище айдишников 
    idSetter = 0;
    localStorage.setItem(`idSetter`, idSetter)
    localStorage.setItem(`Vasilyev_deadline`, JSON.stringify([]));
} else {
    idSetter = localStorage.getItem('idSetter');
}

document.getElementById('addGoodIntoMagasine').addEventListener('click', () => addDeadline()); // добавляем в базу дедлайн

function addDeadline() {

    let goodUniqueDate = Date.parse(document.getElementById("addDate").value); // получаем таймстамп  из вышеприведённой формы 
    let goodUniqueDesc = document.forms.goodUniqueDesc.elements.two.value; // считываем описание дедлайна
    let thisDead;

    if (goodUniqueDate == '' || goodUniqueDesc == '') { // проверяем заполненность форм
        document.getElementById('developConsole').innerText = 'Сформируйте дедлайн как положено - дату, время и описание.';
        return;
    } else {

        thisDead = {
            'id': JSON.parse(localStorage.getItem('idSetter')), // задаём уникальный айдишник основываясь на первой записи локалсторожа
            'date': goodUniqueDate,
            'description': goodUniqueDesc
        };

        idSetter++;
        localStorage.setItem(`idSetter`, idSetter);

        let base = JSON.parse(localStorage.getItem('Vasilyev_deadline'));
        base.push(thisDead);
        localStorage.setItem(`Vasilyev_deadline`, JSON.stringify(base));
    };
    renderCards(JSON.parse(localStorage.getItem('Vasilyev_deadline')));
};



/////////////////// УДАЛЯЕМ ДЕДЛАЙН /////////////////////////////



function deleteDeadline(delId) {

    let base = JSON.parse(localStorage.getItem('Vasilyev_deadline'));

    for (let i = 0; i < base.length; i++) {
        if (base[i]['id'] == delId) {
            base.splice(i, 1);
            localStorage.setItem(`Vasilyev_deadline`, JSON.stringify(base));
            break;
        };
    };

    document.getElementById(`id${delId}`).remove(); // удаляем из DOM

};



///////////////////////// СОЗДАЁМ ПОЛЬЗОВАТЕЛЬСКИЙ ЭЛЕМЕНТ НЕПОЙМИ ЗА КАКИМ ХЕРОМ ////////////////////////////////////



class Counter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        renderCards(JSON.parse(localStorage.getItem('Vasilyev_deadline')));
    }

};

customElements.define("deadline-list", Counter);



///////////////////////// ЗАПОЛНЯЕМ ПОЛЬЗОВАТЕЛЬСКИЙ ЭЛЕМЕНТ КОНТЕНТОМ ////////////////////////////////////



function renderCards(list) { // визуализируем в HTML очередной дедлайн. Это ОЧЕНЬ длинная функция.

    let arr = [...list]; // получаем массив с несколькими объектами, у объектов ключи id, data и description

    for (let i = 0; i < arr.length; i++) {

        let elem = arr[i];

        if (document.getElementById(`id${elem.id}`)) {
            continue
        }
        /* условие сделано для удаления ошибки типа "Failed to execute 'define' on 'CustomElementRegistry': the name 
               "timer-display${N}" has already been used with this registry" при перерендере списка дедлайнов во время удаления или добавления пользовательского элемента. 
               Природа бага так и не выяснена. */

        let cardElem = document.createElement('div');
        cardElem.classList.add('card');
        cardElem.id = 'id' + elem.id;

        let description = document.createElement('div');
        description.classList.add('description');
        description.innerText = elem.description; // описание дедлайна

        let timerDisplay = document.createElement(`timer-display${elem['id']}`); // для каждого дедлайна - свой пользовательский элемент с таймингом.
        timerDisplay.classList.add('timerDisplay');
        timerDisplay.setAttribute('deaddata', elem.date); // таймстамп дедлайна
        timerDisplay.setAttribute('currentdata', Date.parse(new Date())); // текущий таймстамп

        let memorial = document.createElement('div'); // отображаем время и дату окончания дедлайна
        memorial.classList.add('memorial');
        let hohloma = elem.date;
        let newMemorial = new Date(hohloma); // приводим этот таймстамп к человеческому формату
        let day = getZero(newMemorial.getDate());
        let month = getZero(newMemorial.getMonth() + 1);
        let year = newMemorial.getFullYear();
        let hours = getZero(newMemorial.getHours());
        let minutes = getZero(newMemorial.getMinutes());
        memorial.innerText = 'Deadline: ' + day + ' ' + month + ' ' + year + ' в ' + hours + ':' + minutes;

        let btnElem = document.createElement('div'); // создаём кнопку на удаление дедлайна из базы
        btnElem.classList.add('btn');
        btnElem.innerText = 'Delete';
        btnElem.addEventListener('click', () => deleteDeadline(elem['id']));

        cardElem.appendChild(description);
        cardElem.appendChild(memorial);
        cardElem.appendChild(timerDisplay);
        cardElem.appendChild(btnElem);
        containerElem.appendChild(cardElem);

        class UserTimer extends HTMLElement {
            constructor() {
                super();
                this.count = this.getAttribute('currentdata') / 1000; // считываем текущий таймстамп в секундах
                setInterval(() => { // тут обязательно нужна стрелочная функция, безымянная не покатит из-за this
                    this.connectedCallback();
                }, 1000);
            }

            connectedCallback() {
                let delta = this.getAttribute('deaddata') / 1000 - this.count; // вычисляем остаток секунд
                if (delta > 0) { // если дедлайн ещё не просрочен
                    let dayRem = Math.floor(delta / 86400); // округляем кол-во дней в остатке
                    let hoursRem = getZero(Math.floor((delta - dayRem * 86400) / 3600)); // округляем остаток часов и так далее, уповая на неявное приведение типов
                    let minRem = getZero(Math.floor((delta - hoursRem * 3600 - dayRem * 86400) / 60));
                    let secRem = getZero(delta - hoursRem * 3600 - minRem * 60 - dayRem * 86400);
                    if (dayRem > 365) {
                        this.innerText = 'Времени ещё - завались!'; // если до дедлайна больше года
                        this.parentElement.style.background = `rgb(0, 250, 0)` // фон зелёный
                    } else if (dayRem > 0) { // если до дедлайна больше суток
                        this.innerText = 'Remain ' + dayRem + ' day and ' + hoursRem + ' : ' + minRem + " : " + secRem; // отображаем ещё и кол-во дней
                        this.parentElement.style.background = `rgb(0, 250, 0)` // фон зелёный
                    } else { // если до дедлайна меньше суток
                        let gradPercentage = Math.floor(delta / 864); // вычисляем остаток от суток в процентах
                        this.innerText = 'Remain ' + hoursRem + ' : ' + minRem + " : " + secRem; // отображаем только время
                        if (gradPercentage > 49) {
                            this.parentElement.style.background = `linear-gradient(90deg, rgb(250, 0, 0), rgb(0, 250, 0) ${(100 - gradPercentage)*2}%)`; // двигаем градиент
                        } else {
                            this.parentElement.style.background = `linear-gradient(90deg, rgb(250, 0, 0) ${100 - gradPercentage*2}%, rgb(0, 250, 0) 100%)`;
                        }
                    }
                    this.count++;
                } else { // если дедлайн просрочен
                    this.innerText = 'Прости нас, Юра, мы всё.';
                    this.parentElement.style.background = `rgb(250, 0, 0)` // фон полностью красный, соответственно.
                }
            }

            disconnectedCallback() {
                /*          Здесь должно быть что-то, что поможет избежать ошибки типа
                            "Failed to execute 'define' on 'CustomElementRegistry': the name "timer-display${N}" has already been used with this registry"
                            при удалении или добавлении пользовательских элементов через API */
            }

            static get observedAttributes() {
                return ['deaddata', 'currentdata' /* массив имён атрибутов для отслеживания их изменений */ ];
            }
        };

        customElements.define(`timer-display${elem['id']}`, UserTimer); // определяем пользовательский тайминг-элемент

    };


    document.querySelector('#crutchID').appendChild(containerElem);
};