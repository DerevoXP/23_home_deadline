/* 1) необходимо разработать пользовательский элемент, который отображает кол-во дней минут и секунд до дедлайна и описание дедлайна (что нужно сделать).

2) необходимо добавить интерфейс, который позволит добавлять дедлайны

3) дедлайны должны сохраняться в Localstorage в виде массива объектов и при обновлении страницы отображаться 

5) необходимо добавить кнопку, которая будет удалять элемент с дедлайном из localstorage 

6)при достижени дедлайна цвет заднего фона должен меняться от зеленого к красному. (если есть еще сутки, то задний фон абсолютно зеленый, дедлайн просрочен, то абсолютно красный, переход должен быть постепенным).

7)необходимо помимо обычного добавления дз в репу git необходимо опубликовать дз на github pages. Информацию о процессе можно погуглить */



"use strict";



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



///////////////////// ЧТО КАСАЕТСЯ ДАТАБАЗЫ (ПО УМОЛЧАНИЮ РАБОТАЕТ АВТОМАТОМ - ДЛЯ РУЧНОГО РЕЖИМА РАСКОММЕНТЬ HTML) ////////////////////////////////////



let db; // объявляем переменную, которая будет датабазой

try {
    db = openDatabase('huw5', '1.0', 'Test DB', 2 * 1024 * 1024); // задаём характеристики датабазы
} catch {
    alert('Ошибка! В вашем браузере не стоит WebSQL! Попробуйте загрузить Google Chrome с официального сайта и пользоваться впредь исключительно этим браузером.'); // проверка на то, поддерживает ли браузер клиента WebSQL
};

// удаляем таблицу дедлайнов, если вдруг приспичило

let dropGoodTable = `drop table Vasilyev_deadline`;

function dropGoodTables() {
    db.transaction(function (tx) {
        tx.executeSql(
            dropGoodTable,
            [],
            () => document.getElementById('developConsole').innerText = 'Таблица успешно угроблена.',
            () => document.getElementById('developConsole').innerText = 'Удалить таблицу дедлайнов почему-то не удалось.'
        );
    });
    setTimeout(() => {
        window.location.reload()
    }, 500);
};

// создаём таблицу дедлайнов

let databaseCreate = ` 
    create table Vasilyev_deadline(
        id integer primary key autoincrement,
        date decimal,
        description varchar(1024)
    )`;

addMagasine(); // УЗНАЙ, КАК ПРОВЕРИТЬ СУЩЕСТВОВАНИЕ ТАБЛИЦЫ, ЧТОБЫ ДОБАВИТЬ УСЛОВНЫЙ ОПЕРАТОР!!!

function addMagasine() {
    db.transaction(function (tx) {
        tx.executeSql(
            databaseCreate,
            [],
            () => document.getElementById('developConsole').innerText = 'Таблица дедлайнов пересоздана и пока что пуста',
            // () => document.getElementById('developConsole').innerText = 'Не удалось создать таблицу дедлайнов.' // чтоб не заёбывала
            () => console.log('Не удалось создать таблицу дедлайнов. Скорее всего, она уже существует.')
        );
    });
};

// добавляем дедлайны

let goodInsert = 'insert into Vasilyev_deadline(date, description) values(?, ?)'; // маска для добавления товара в магазин. Хуй знает, как она работает.

document.getElementById('addGoodIntoMagasine').addEventListener('click', () => addDeadline());

function addDeadline() {

    let goodUniqueDate = Date.parse(document.getElementById("addDate").value); // получаем таймстамп  из вышеприведённой формы 
    let goodUniqueDesc = document.forms.goodUniqueDesc.elements.two.value; // считываем описание дедлайна

    if (goodUniqueDate == '' || goodUniqueDesc == '') {
        document.getElementById('developConsole').innerText = 'Сформируйте дедлайн как положено - дату, время и описание.';
        return;
    } else {
        db.transaction(function (tx) {
            tx.executeSql(
                goodInsert,
                [goodUniqueDate, goodUniqueDesc],
                () => setTimeout(() => {
                    window.location.reload()
                }, 500), // это костыль. Пиздецкий костыль. Прям фу, какой костыль. Стыдно!,
                () => document.getElementById('developConsole').innerText = 'Не удалось добавить дедлайн.'
            );
        });
    };
    selectAllGood();
};



///////////////////////// СОЗДАЁМ ПОЛЬЗОВАТЕЛЬСКИЙ ЭЛЕМЕНТ НЕПОЙМИ ЗА КАКИМ ХЕРОМ ////////////////////////////////////



class Counter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        selectAllGood();
    }

};

customElements.define("deadline-list", Counter);



///////////////////////// ЗАПОЛНЯЕМ ПОЛЬЗОВАТЕЛЬСКИЙ ЭЛЕМЕНТ КОНТЕНТОМ ////////////////////////////////////



function selectAllGood() { // запрашиваем список элементов из таблицы

    db.transaction(function (tx) {
        tx.executeSql('select * from Vasilyev_deadline;',
            [],
            (tx, response) => renderCards(response.rows), // запускаем фенкцию отображения элементов в HTML
            () => document.getElementById('developConsole').innerText = 'Для начала создайте таблицу дедлайнов!'
        );
    });
};

function renderCards(list) { // визуализируем в HTML очередной дедлайн. Это ОЧЕНЬ длинная функция.

    document.querySelector('#crutchID').innerHTML = ''; // очищаем пользовательский элемент перед добавлением нового дедлайна

    let arr = [...list]; // получаем массив с тремя объектами, у объектов ключи id, data и description
    let containerElem = document.createElement('div');
    containerElem.classList.add('container');

    arr.forEach(function (elem) { // перебираем КАЖДЫЙ элемент массива по ключам id, data и description

        let cardElem = document.createElement('div');
        cardElem.classList.add('card');

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
                    let hoursRem = getZero(Math.floor((delta - dayRem * 86400) / 3600));  // округляем остаток часов и так далее, уповая на неявное приведение типов
                    let minRem = getZero(Math.floor((delta - hoursRem * 3600 - dayRem * 86400) / 60));
                    let secRem = getZero(delta - hoursRem * 3600 - minRem * 60 - dayRem * 86400);
                    if (dayRem > 0) { // если до дедлайна больше суток
                        this.innerText = 'Remain ' + dayRem + ' day and ' + hoursRem + ' : ' + minRem + " : " + secRem; // отображаем ещё и кол-во дней
                        this.parentElement.style.background = `rgb(0, 250, 0)` // фон зелёный
                    } else { // если до дедлайна меньше суток
                        let gradPercentage = Math.floor(delta/864); // вычисляем остаток от суток в процентах
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

            static get observedAttributes() {
                return ['deaddata', 'currentdata' /* массив имён атрибутов для отслеживания их изменений */ ];
            }            
        };
        customElements.define(`timer-display${elem['id']}`, UserTimer); // определяем пользовательский тайминг-элемент
    });
    document.querySelector('#crutchID').appendChild(containerElem);
};

// удаляем дедлайн из таблицы

function deleteDeadline(delId) {
    db.transaction(function (tx) {
        tx.executeSql(
            `delete from Vasilyev_deadline where id=${delId}`,
            [],
            () => document.getElementById('developConsole').innerText = `Дедлайн удалён. Обновите страницу, если она не сделает это автоматически!`,
            () => document.getElementById('developConsole').innerText = 'Дедлайн не удален.'
        );
    });
    selectAllGood();
    setTimeout(() => {
        window.location.reload()
    }, 500); // И это тоже костыль. Только конченые говнокодеры используют такие костыли. Если ты не говнокодер, срочно выясни, почему при удалении и добавлении элементов в консоли появляется ошибка типа /* Failed to execute 'define' on 'CustomElementRegistry': the name "timer-display${N}" has already been used with this registry */
};