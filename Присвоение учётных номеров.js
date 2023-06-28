/*данный процесс используется не только при внесении записи в реестр черед процесс, но так же при создании реестровой записи (пока что) , соотв reestrOrder.ApplicantType.Code там работать не будет пока что. Можно через инструмент разработчика поискать где используется чтобы либо подтвердить либо опровергнуть*/
(() => {
    let record;
    if (typeof reestrOrder === 'undefined') {
        /* Временный фикс по комментарию, указаному в первых строках */
        record = query(entityIdRecord).limit(1).addField("SubjectCountry.Code").addField("ApplicantUL.OrganizationalLegalForm.Code").addField("RegistryType.Code").addField("TypeNPOForeignAgent.Code").condition(field("objectId").eq(objectIdRecord)).consumeUniversal();
    } else {
        if (reestrOrder.ApplicantType.Code == "UL") {
            record = query(entityIdRecord).limit(1).addField("SubjectCountry.Code").addField("ApplicantUL.OrganizationalLegalForm.Code").addField("RegistryType.Code").addField("TypeNPOForeignAgent.Code").condition(field("objectId").eq(objectIdRecord)).consumeUniversal();
        } else {
            record = null;
        }
    }
    if (record) {
        let firstDayThisYear = formatDate(new Date(), "yyyy-01-01"),
            conditionRegister = field("RegistrationDate").gte(firstDayThisYear).and(field("RegistryType.Code").eq(record[0][2])).and(field("RegistrationNumber").isNotEmpty());
        let lastNumberRegister = query(entityIdRecord).addField("RegistrationNumber").condition(conditionRegister).limit(1)
            .sort("__createDate__sys", false)
            .consumeUniversal(),
            findNumberRegister = 1;
        if (lastNumberRegister && lastNumberRegister.length && record[0][0] && record[0][1]) {
            findNumberRegister = lastNumberRegister[0][0];
            findNumberRegister = findNumberRegister.slice(record[0][2] == "RegistryForeignAgentNPO" ? 5 : 6);
            findNumberRegister = Number(findNumberRegister) + 1;
        } else {
            info("not found record[0][0] or record[0][1] or lastNumberRegister");
        }
        info("find Number RegistrationNumber +1>>>" + findNumberRegister);
        findNumberRegister = findNumberRegister.toString();
        findNumberRegister = findNumberRegister.length >= 4 ? findNumberRegister : findNumberRegister.padStart(4, "0");
        if (!!record[0][2] && record[0][2] == "RegistryForeignAgentNPO") {
            findNumberRegister = record[0][3] + record[0][0] + formatDate(new Date(), "yy") + findNumberRegister;
        } else {
            findNumberRegister = record[0][0] + (!!record[0][1] ? record[0][1] : 1201) + findNumberRegister;
        }
        info("find Number RegistrationNumberresult>>>" + findNumberRegister);
        query(entityIdRecord).update("RegistrationNumber", findNumberRegister).condition(field("objectId").eq(objectIdRecord)).consume();
    }
})();

//Сквозная нумерация реестровых записей

let records = [];

if (typeRegistry.UseApplicantType && recordRegistry.ApplicantType) {
    records = query(typeRegistry.ReestrEntityName).condition(
            field("RegistrationNumber").isNotEmpty()
            .and(field("ApplicantType.Code").eq(recordRegistry.ApplicantType.Code))
            .and(field("RegistryType.Code").eq(recordRegistry.RegistryType.Code))
        )
        .limit(1)
        .sort("__createDate__sys", false)
        .consume();
} else {
    records = query(typeRegistry.ReestrEntityName).condition(
            field("RegistrationNumber").isNotEmpty()
            .and(field("RegistryType.Code").eq(recordRegistry.RegistryType.Code))
        )
        .limit(1)
        .sort("__createDate__sys", false)
        .consume();
}
let regNumberRecord = "1";
if (records && records.length) {
    let lastRecord = records[0];
    info("The last record has reg number - " + lastRecord.RegistrationNumber);
    regNumberRecord = (Number(lastRecord.RegistrationNumber) + 1).toFixed();
}

info("Set reg number № " + regNumberRecord + " for record " + recordRegistry.objectId);
recordRegistry.RegistrationNumber = regNumberRecord;