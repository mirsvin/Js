//Изменение статуса в реестре

window.RecordRegistry = {}; 
window.RecordRegistry.objectId = objectId;
const CODE_REGISTRY = "RegistryTechnicalExperts";
const CODE_ACTION = "Cancel";

(async () => {
    async function getSettingAction(CODE_REGISTRY, CODE_ACTION) {
        return await $.ajax({
            type: "POST",
            url: "/rest/data/entity/",
            contentType: "application/json",
            data: JSON.stringify({
                "entityId": "07689d6b-193c-c472-0220-6ca076806833",
        		"bindType": "UML",
                "attributes": ["FormID", "FormHeaderName"],
                "useCondition": true,
                "dataCondition": "TypeRegistry.Code == '" + CODE_REGISTRY + "' AND RegistryAction.Code == '" + CODE_ACTION + "'",
                "limit": 10,
            })
        });
    };
    
    let dataRecord = await $.get("rest/data/entity/" + objectId + "?attributes=CurrentStatusGRET.DateDocument,RegistryStatus.Code");

	window.RecordRegistry.LastStatusDate = dataRecord["CurrentStatusGRET.DateDocument"];
    let actions = await getSettingAction(CODE_REGISTRY, CODE_ACTION);
    if (!actions.length || actions.length > 1) {
        toastr.warning("Некорректные настройки смены статов в реестре.");
    } else if (actions.length == 1) {
    	window.action = {};
    	[window.action.objectId, window.action.FormID, window.action.FormHeaderName] = actions[0];
    	if (window.action.FormID) {
    		kitShowForm(window.action.FormID, undefined, false, window.action.FormHeaderName, false); 
    	} else {
    		toastr.error("Не задана форма смены статуса.");
    	}
    }
})();

//Формирование выписки из реестра

(async () => {
    try {
        kitBlockUI("Формирование выписки из реестра...");

        let {
            file, recordStatement
        } = await $.ajax({
            type: "POST",
            url: "/rest/processes/executeOnline/c9992a90-723d-8664-2da3-98177ae0c89e",
            contentType: "application/json",
            data: JSON.stringify({
                "recordRegistry": objectId,
                "performer": visUser.objectId,
                "onlineBpTimeout": 60000
            })
        });
        if (!file) {
            throw new Error("file is empty");
        } else {
            console.log(recordStatement);
            toastr.success("Выписка успешно сформирована. Открываю форму подписания...");
            kitShowForm("50ff953e-4574-aa81-6dc2-3bb0eb24889b", recordStatement, false, undefined, false);
        }
    } catch (err) {
        toastr.error("Произошла ошибка при формировании выписки. Пожалуйста, обратитесь в техническую поддержку");
        console.error(err);
    } finally {
        kitUnblockUI();
    }
})();

//кастомное удаление из реестра

(async () => {
    let responseData = await $.ajax({
        type: "POST",
        url: "/rest/data/entity/",
        contentType: "application/json",
        data: JSON.stringify({
            "entityId": "a33e0f48-7f3b-59c7-dad5-a109315b91b9",
            "bindType": 'UML', 
            "attributes": [],
            "useCondition": true,
            "dataCondition": "LawEducation.objectId == '" + objectId + "'",
            "limit": 10,
        }),
    });
    if (responseData.length) {
        toastr.error("Вы пытаетесь удалить образование, которое выбрано у адвокатов");
    } else {
       await $.ajax({
            type: "DELETE",
            url: '/rest/data/entity/' + objectId,
            contentType: 'application/json',
        });
        toastr.success("Образование успешно удалено");
        setTimeout(() => reloadGrid(objectId), 1000);
    }
})();

//запрос на просомтр записи в реестре

$.get("rest/data/entity/" + objectId +"?attributes=RegisterAttorney").done(objectData => {
    kitShowModalForm("1a00127f-6801-8129-4344-5ea331a0b898", objectData['RegisterAttorney'], true, "Адвокат", true, true);
}).fail(errorData => {
    toastr.error("Произошла ошибка при обработке заявления. Пожалуйста, обратитесь в техническую поддержку");
    console.error(errorData);
});

//подсчёт процентного соотношения в записи реестра

let listKey = [{
    key: 'RegistrationNumber',
    title: 'Регистрационный номер'
}, {
    key: 'ApplicantFLFact.Surname',
    title: 'Фамилия'
}, {
    key: 'ApplicantFLFact.Name',
    title: 'Имя'
}, {
    key: 'ApplicantFLFact.Patronymic',
    title: 'Отчество'
}, {
    key: 'SubjectCountry.Name',
    title: 'Субъект РФ'
}, {
    key: 'ExamPassed',
    title: 'Экзамен сдан'
}, {
    key: 'NotrariumStatus.Name',
    title: 'Статус нотариуса'
}, {
    key: 'Acting',
    title: 'Исполняющий обязанности'
}, {
    key: 'ChangeName',
    title: 'Изменение ФИО'
}, {
    key: 'PublicationForbidden',
    title: 'Запрещена ли публикация на внешнем портале'
}]

let RegistryEntity = "Notaries.RegisterNotaries"

let globCount = query(RegistryEntity).condition(field("RegistryType.Code").eq("RegistryNotaries")).count();
listKey.forEach(function (element, index) {
    let count = query(RegistryEntity).condition(
        field(element.key).isNotEmpty()
        .and(field("RegistryType.Code").eq("RegistryNotaries"))
    ).count();
    element.count = count ? ((count * 100) / globCount).toFixed(0) + "%" : "0%";
});

//Проверка на наличие дубликата в реестре(не позволяет добавить запись в реестр с одинаковыми ФИО)

$scope.$on('formReady', function() {
    kitGetFormElement("element_SystemFields").hide();
    $(kitGetFormElement('element_ApplicantFL').input()).on("change", function() {
        $.get("rest/data/entity/" + kitGetFormElement('element_ApplicantFL').val()).done(function(data){
            if (kitGetFormElement('element_ApplicantFL').val()) {
                $.ajax({
                    type: "POST",
                    url: "/rest/data/entity/",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "entityId": "90fabd0d-133f-0623-c586-19fab6c11a41",
                        "attributes": [],
                        "useCondition": true,
                        "bindType": "entity",
                        "dataCondition": "ApplicantFL.Surname == '" + data.Surname + "' AND ApplicantFL.Name == '" + data.Name + "' AND ApplicantFL.Patronymic == '" + data.Patronymic + "'",
                        "limit":1 
                    }),
                    success: function(data) {
                        if (data.length) {
                            kitShowModal("Дубликат записи в реестре", "<b align='center'>Такой Иностранный адвокат уже находится в реестре</b>", false, { 
                                "action": function ($scope) {
                                    $scope.cancel();
                                }
                            }) 
                        }
                    },
                    error: function(errorData) {
                        console.error(errorData);
                    }
                });
            }
        });
    })
})

//Проставление документу в реестре признака выдан

(async () => {
    window.documentsToIssued = Array.isArray(objectId) ? objectId : window.documentsToIssued = [objectId];
    let cond = "(";
    for (let i=0; i < window.documentsToIssued.length; i++){
        if (i != window.documentsToIssued.length - 1) {
            cond += "objectId == '" + window.documentsToIssued[i] + "' OR ";
        } else {
            cond += "objectId == '" + window.documentsToIssued[i] + "'";
        }
    }
    cond += ") ";
    let condIssured = cond + " AND Issued == true";
    let condStatus  = cond + " AND Status.Code == 'waitDecision'";
    let documentsIssued = await $.ajax({
        type: "POST",
        url: "/rest/data/entity",
        contentType: "application/json",
        data: JSON.stringify({
        "entityId": "a5b2eea6-2bd6-c676-67c3-eca3e6ecaea9",
        "attributes" : [],
        "useCondition": true,
        "dataCondition": condIssured,
        "limit": 1000
        })
    }); 
    let documentsFinishedStatus = await $.ajax({
        type: "POST",
        url: "/rest/data/entity",
        contentType: "application/json",
        data: JSON.stringify({
        "entityId": "a5b2eea6-2bd6-c676-67c3-eca3e6ecaea9",
        "attributes" : [],
        "useCondition": true,
        "dataCondition": condStatus,
        "limit": 1000
        })
    }); 
    window.textWarning = "<h3 align='center'>" + "Вы выбрали " + window.documentsToIssued.length + " документов на выдачу." + "</h3>";
    if (documentsIssued.length) { 
    window.textWarning += "<h5 align='center'>"+"<br>Среди выбранных документов, есть " + documentsIssued.length + " документ(-ов), который(ые) уже были выданы ранее." + "<br><br>При повторной выдачи дата фактической выдачи этих документов будет обновлена."+ "</h5>";
    }
    if (documentsFinishedStatus.length) {
    window.textWarning +="<h5 align='center'>"+"<p style='color:#ff0000'" +  "<br>Среди выбранных документов, есть " + documentsFinishedStatus.length + " документ(-ов), который(ые) не находятся в финальном статусе." + "<strong>"+"<br><br>Они не будут участовать в выдаче" + "<strong>" + "</p>"+ "</h5>";
    }
    kitShowModalForm("5b9b726b-9e94-c2ab-d73f-f251e6c27595", undefined, false, "Проставление документу признака выдачи", null, false);
})();