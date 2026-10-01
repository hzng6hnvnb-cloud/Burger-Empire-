let money = 100;

let sales = 0;

let reputation = 1;

let branches = 1;

let level = 1;

let customers = 0;

let burgerPrice = 10;


const upgrades = {

    quality: {
        level: 1,
        cost: 100
    },

    speed: {
        level: 1,
        cost: 150
    },

    chef: {
        level: 1,
        cost: 300
    },

    tables: {
        level: 1,
        cost: 500
    },

    delivery: {
        level: 0,
        cost: 1000
    },

    restaurant: {
        level: 1,
        cost: 2500
    }

};


function moneyFormat(value) {

    return Math.floor(value)
        .toLocaleString("ar-SA");

}


function update() {

    document.getElementById("money").textContent =
        moneyFormat(money);

    document.getElementById("moneyStat").textContent =
        moneyFormat(money);

    document.getElementById("sales").textContent =
        moneyFormat(sales);

    document.getElementById("reputation").textContent =
        reputation.toFixed(1);

    document.getElementById("branches").textContent =
        branches;

    document.getElementById("level").textContent =
        level;

    document.getElementById("burgerPrice").textContent =
        burgerPrice;

    document.getElementById("customers").textContent =
        customers;

    document.getElementById("restaurantStars").textContent =
        reputation.toFixed(1);


    document.getElementById("qualityLevel").textContent =
        upgrades.quality.level;

    document.getElementById("speedLevel").textContent =
        upgrades.speed.level;

    document.getElementById("chefLevel").textContent =
        upgrades.chef.level;

    document.getElementById("tablesLevel").textContent =
        upgrades.tables.level;

    document.getElementById("deliveryLevel").textContent =
        upgrades.delivery.level;

    document.getElementById("restaurantLevel").textContent =
        upgrades.restaurant.level;


    document.getElementById("qualityCost").textContent =
        moneyFormat(upgrades.quality.cost);

    document.getElementById("speedCost").textContent =
        moneyFormat(upgrades.speed.cost);

    document.getElementById("chefCost").textContent =
        moneyFormat(upgrades.chef.cost);

    document.getElementById("tablesCost").textContent =
        moneyFormat(upgrades.tables.cost);

    document.getElementById("deliveryCost").textContent =
        moneyFormat(upgrades.delivery.cost);

    document.getElementById("restaurantCost").textContent =
        moneyFormat(upgrades.restaurant.cost);


    updateUpgradeButtons();

    updateAchievements();

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 1800);

}


/*
    بيع برجر
*/

document
    .getElementById("sellButton")
    .addEventListener(
        "click",
        sellBurger
    );


function sellBurger() {

    const income =
        burgerPrice * branches;


    money += income;

    sales++;

    customers++;


    if (customers > 50) {

        customers = 50;

    }


    reputation += 0.01;


    if (reputation > 5) {

        reputation = 5;

    }


    calculateLevel();


    showToast(
        `🍔 بعت برجر وربحت ${moneyFormat(income)} ريال`
    );


    update();

}


/*
    التطويرات
*/

document
    .querySelectorAll(".upgrade-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const type =
                    this.dataset.upgrade;

                buyUpgrade(type);

            }
        );

    });


function buyUpgrade(type) {

    const upgrade =
        upgrades[type];


    if (!upgrade) return;


    if (money < upgrade.cost) {

        showToast("💸 فلوسك ما تكفي!");

        return;

    }


    money -= upgrade.cost;


    upgrade.level++;


    if (type === "quality") {

        burgerPrice += 2;

        upgrade.cost =
            Math.floor(
                upgrade.cost * 1.65
            );

        reputation += 0.15;

    }


    if (type === "speed") {

        upgrade.cost =
            Math.floor(
                upgrade.cost * 1.75
            );

        reputation += 0.1;

    }


    if (type === "chef") {

        upgrade.cost =
            Math.floor(
                upgrade.cost * 1.8
            );

    }


    if (type === "tables") {

        upgrade.cost =
            Math.floor(
                upgrade.cost * 1.9
            );

        reputation += 0.2;

    }


    if (type === "delivery") {

        upgrade.cost =
            Math.floor(
                upgrade.cost * 2
            );

    }


    if (type === "restaurant") {

        upgrade.cost =
            Math.floor(
                upgrade.cost * 2.5
            );

        reputation += 0.4;

        document.getElementById(
            "restaurantStatus"
        ).textContent =
            "مطعم مطوّر 🔥";

    }


    if (reputation > 5) {

        reputation = 5;

    }


    calculateLevel();


    showToast(
        "🔥 تم شراء التطوير!"
    );


    update();

}


/*
    الدخل التلقائي
*/

setInterval(
    function() {

        let automaticIncome = 0;


        automaticIncome +=
            upgrades.chef.level * 3;


        automaticIncome +=
            upgrades.delivery.level * 8;


        automaticIncome +=
            upgrades.speed.level * 2;


        automaticIncome *= branches;


        if (automaticIncome > 0) {

            money += automaticIncome;

            customers +=
                upgrades.speed.level;


            if (customers > 50) {

                customers = 50;

            }


            calculateLevel();

            update();

        }

    },
    1000
);


/*
    فتح الفرع الثاني
*/

document
    .getElementById("branchButton")
    .addEventListener(
        "click",
        function() {

            const cost = 10000;


            if (branches >= 2) {

                showToast(
                    "الفرع مفتوح بالفعل!"
                );

                return;

            }


            if (money < cost) {

                showToast(
                    "💸 تحتاج 10,000 ريال!"
                );

                return;

            }


            money -= cost;

            branches = 2;

            reputation += 0.5;


            document
                .getElementById("branch2")
                .classList.remove("locked");


            this.textContent =
                "✅ مفتوح";


            calculateLevel();

            showToast(
                "🏪 فتحت فرعًا جديدًا!"
            );


            update();

        }
    );


/*
    مستوى اللاعب
*/

function calculateLevel() {

    const newLevel =
        Math.floor(
            sales / 25
        ) + 1;


    if (newLevel > level) {

        level = newLevel;

        showToast(
            `🎉 وصلت للمستوى ${level}!`
        );

    }

}


/*
    تعطيل أزرار التطوير إذا ما عندك فلوس
*/

function updateUpgradeButtons() {

    document
        .querySelectorAll(".upgrade-button")
        .forEach(button => {

            const type =
                button.dataset.upgrade;

            const upgrade =
                upgrades[type];


            if (money < upgrade.cost) {

                button.classList.add(
                    "disabled"
                );

            } else {

                button.classList.remove(
                    "disabled"
                );

            }

        });

}


/*
    الإنجازات
*/

function updateAchievements() {

    const first =
        document.getElementById(
            "achievement1"
        );


    const second =
        document.getElementById(
            "achievement2"
        );


    const third =
        document.getElementById(
            "achievement3"
        );


    if (sales >= 1) {

        first.classList.add(
            "unlocked"
        );

        first.querySelector(
            "span"
        ).textContent = "✅";

    }


    if (money >= 1000 || sales >= 100) {

        second.classList.add(
            "unlocked"
        );

        second.querySelector(
            "span"
        ).textContent = "✅";

    }


    if (branches >= 2) {

        third.classList.add(
            "unlocked"
        );

        third.querySelector(
            "span"
        ).textContent = "✅";

    }

}


/*
    البداية
*/

update();
