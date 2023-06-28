//Составление запроса на поиск РК в СЭД

function updateDate(datefirst) {
    return String(formatDate(datefirst, "dd.MM.yyyy"));
}

function updateDateSpan(dateFirst, dateSeconf) {
    let dateToday = new Date();
    let dateOld = new Date();
    dateToday.setDate(dateToday.getDate() + dateFirst);
    dateOld.setDate(dateOld.getDate() + dateSeconf);
    return String(formatDate(dateToday, "dd/MM/yyyy") + ":" + formatDate(dateOld, "dd/MM/yyyy"));
}

info("docRCRegNumber >>> " + docRCRegNumber);
// то что пишем в get RK, взять из п2
let docDate = updateDateSpan(-3, 2);
info("docDate>>>>" + docDate);
let requestSearch = {
    "Rc.DocDate": docDate,
    "Rc.REGNUM": docRCRegNumber
};
uuidRCRerespons = getRandom();
info("uuidRCRerespons >>> " + uuidRCRerespons);
sendSED("GET_RC", uuidRCRerespons, requestSearch);

/* ессе
сам ответ- json, надо распарситьп ример можно взять с п2
 получить из него РК заполнить из нее данными  на подформе
подформу вставить в РВ услуги в казаки, не тест
на подформу из order взять переменные, которые редко используют изаполнить их значениями из СЭД
могу протестировать:
    распарсить ответ и отобразить на подформе*/



//Создание организации и отправка запроса

// Сохранение или поиск данных о гражданине
function createCitizen(personFactDigit) {
    // ЗАВИСИМОСТИ
    // aDue_region - REGION_CL.DUE
    // aIsn_Addr_Category - ADDR_CATEGORY_CL.ISN_LCLASSIF
    // aCitstatusCl_Due - CITSTATUS_CL.DUE
    citizenSED = createObject("SEDIntegration.SaveCitizenWebV2", {
        //"aOper": "GI", // Операция. Поиск/создание гражданина
        "aSurname": personFactDigit.Surname + " " + personFactDigit.Name + " " + personFactDigit.Patronymic, // ФИО
        "aZipcode": personFactDigit.FactAddress ? personFactDigit.FactAddress.zipcode: "", // Почтовый индекс
        "aCity": personFactDigit.FactAddress ? personFactDigit.FactAddress.city: "", // Город
        "aAddress": personFactDigit.FactAddress ? personFactDigit.FactAddress.fullAddress: "", // Адрес гражданина
        //"aDue_region":  getRegion(personFactDigit.FactAddress), // !!! Код due региона, в соответствие со справочником "Регионы"
        "aIsn_Addr_Category": 0, // !!! Категория адресата. 
        //"aCitstatusCl_Du": , // !!! Код due статуса, в соответствие со справочником "Статус заявителя" 
        "aEmail": personFactDigit.Email, // Адрес электронной почты гражданина
        "aPhone": personFactDigit.Phone ? personFactDigit.Phone : personFactDigit.MobilePhone, // Номер телефона гражданина
        "aNote": formatDate(personFactDigit.BirthDate, "dd.MM.yyyy"), // Примечание - дату рождения
        "aInn": personFactDigit.INN, // ИНН гражданина
        "aSnils": personFactDigit.SNILS, // СНИЛС гражданина
        //"aSex": personFactDigit.Gender && personFactDigit.Gende.Code == "" ? 1 : 0, // Пол
        "aSeries": personFactDigit.PermitDocSerial, // Серия паспорта
        "aNPasport": personFactDigit.PermitDocNumber, // Номер паспорта
        "aGiven": personFactDigit.PermitDocIssuer +" " + formatDate(personFactDigit.PermitDocIssueDate, 'dd.MM.yyyy'),  // Кем и когда выдан
    });  
    info("citizenSED>>>>>" + citizenSED);
    sendSED("SAVE_CITIZEN_WEB", personSED); 
};

// Поиск или созданние данных об организации в СЭД
function createOrgSED(orgFactDigit) {
    // ЗАВИСИМОСТИ
    // aHighNode - ORGANIZ_CL.DUE, ORGAINZ_CL.ISN_NODE
    // aDue_region - REGION_CL.DUE
    // aIsnAddrCategory - ADDR_CATEGORY_CL.ISN_LSCLASSIF
    orgSED = createObject("SEDIntegration.SaveOrganizWebV2", {
        "aOper": "GI", // Операция. Поиск/создание организации
        //"aHighNode": , // NOT USE. Идентификатор или код due родительской записи для операции 'I'
        "aClassifName": orgFactDigit.FullName, // Наименование
        "aZipCode": orgFactDigit.RegAddress ? orgFactDigit.RegAddress.zipcode : "", // Почтовый индекс
        "aCity": orgFactDigit.RegAddress ? orgFactDigit.RegAddress.city : "", // Город
        "aAddress": orgFactDigit.RegAddress ? orgFactDigit.RegAddress.fullAddress : "", // Адрес организации 
        "aFullname": orgFactDigit.FullName, // Информационный атрибут новой организации (имя)
        //"aOkpo": , // NOT USE. Информационный атрибут новой организации (ОКПО).
        "aInn": orgFactDigit.INN, // Информационный атрибут новой организации (ИНН)
        //"aDue_region": orgFactDigit.SubjectRF.Code, // Код due региона, в соответствие со справочником "Регионы"
        "aEmail": orgFactDigit.Email, // Электронный адрес
        "aMailForAll": 0, // NOT USE. Признак использования E_MAIL для всех представителей
        "aIsnAddrCategory": 0, // !!! Категория адресата 
        "aNote": orgFactDigit.Comment,// Примечание
        //"aOkonh": , // NOT USE. Код по ОКОНХ
        "aLawAdress": orgFactDigit.RegAddress ? orgFactDigit.RegAddress.fullAddress : "", // Юридический адрес организации
        //"aSertificat": ,// NOT USE. Сертификат 
        //"aCode": , // Код организации 
        //"aOGRN": "2200022200022",
    });
    info("orgSED >>>>> " + orgSED);
    sendSED("SAVE_ORGANIZ_WEB", orgSED);
};


order.OrderSED = createObject("ServiceSEDIntegration.OrderSED", {
    "OrderDigit": order,
});

order.OrderSED.Status = getObject("ServiceSEDIntegration.Status", {"Code": "FormingRequest"});

if (order.ApplicantType.Code == "FL") { 
    createCitizen(order.ApplicantFLFact);
} else if (order.ApplicantType.Code == "UL") {
    createOrgSED(order.ApplicantULFact);
} else {
    errorCreateApplicant = true;
}

