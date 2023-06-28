info("Выписки: Поиск информации в реестре!");
abstractReestr = [];
info("mainOrder.ServiceType.objectId >>> " + mainOrder.ServiceType.objectId);
let serviceTypeOut = getObject("ExpandService.ExpandServiceType", {
    "objectId": mainOrder.ServiceType.objectId
});
info("serviceTypeOut.objectId >>> " + serviceTypeOut.objectId);
if (serviceTypeOut.ReestrEntityName) {
    if (serviceTypeOut.ReestrEntityName === "RegistryNonProfitOrganizations.NonProfitOrganization") {
        abstractReestr = query("RegistryNonProfitOrganizations.NonProfitOrganization")
            .condition(
                field("ApplicantUL.FullName").eq(order.AskName)
                .or(field("ApplicantUL.OGRN").eq(order.AskOGRN))
            ).consume();
    }
    if (serviceTypeOut.ReestrEntityName === "ForeignLawyers.RegisterForeignLawyers") {
        abstractReestr = query("ForeignLawyers.RegisterForeignLawyers")
            .condition(
                field("ApplicantFLFact.Surname").eq(mainOrder.Surname)
                .and(field("ApplicantFLFact.Name").eq(mainOrder.Name))
                .and(field("ApplicantFLFact.Patronymic").eq(mainOrder.Patronymic))
                .and(field("SprCountry.objectId").eq(mainOrder.SprCountry.objectId))
            ).consume();
        /*let addAbstractReestr = query("ForeignLawyers.RegisterForeignLawyers")
            .condition(
                field("ApplicantFLFact.Surname").eq(mainOrder.Surname)
                .and(field("ApplicantFLFact.Name").eq(mainOrder.Name))
                .and(field("ApplicantFLFact.Patronymic").eq(mainOrder.Patronymic))
                .and(field("SprCountry.objectId").eq(mainOrder.SprCountry.objectId))
            ).consume();
        if (addAbstractReestr && addAbstractReestr.length) {
            addAbstractReestr.forEach(element => abstractReestr.push(element));
        }*/
    }
    if (serviceTypeOut.ReestrEntityName === "Notaries.RegisterNotaries") {
        if (mainOrder.sprApplicant.Code == "IsNotary" || mainOrder.sprApplicant.Code == "IsPassedExam") {
            abstractReestr = query("Notaries.RegisterNotaries")
                .condition(
                    field("ApplicantFLFact.Surname").eq(mainOrder.ApplicantFL.Surname)
                    .and(field("ApplicantFLFact.Name").eq(mainOrder.ApplicantFL.Name))
                ).consume();
            let addAbstractReestr = query("Notaries.RegisterNotaries")
                .condition(
                    field("ApplicantFLFact.Surname").eq(mainOrder.ApplicantFL.Surname)
                    .and(field("ApplicantFLFact.Name").eq(mainOrder.ApplicantFL.Name))
                    .and(field("RegistrationNumber").eq(mainOrder.RegistrationNumber))
                ).consume();
            info("abstractReestr>>>" + abstractReestr);
            info("addAbstractReestr>>" + addAbstractReestr);
            if (addAbstractReestr && addAbstractReestr.length) {
                addAbstractReestr.forEach(element => abstractReestr.push(element));
                abstractReestr = abstractReestr.filter(function (item, pos, array) {
                    return array.map(function (mapItem) {
                        return mapItem['objectId'];
                    }).indexOf(item['objectId']) === pos;
                });
            }
            info("abstractReestr itog>>" + abstractReestr);
        } else if (mainOrder.sprApplicant.Code == "IsInterested") {
            abstractReestr = query("Notaries.RegisterNotaries")
                .condition(
                    field("ApplicantFLFact.Surname").eq(mainOrder.Surname)
                    .and(field("ApplicantFLFact.Name").eq(mainOrder.Name))
                ).consume();
            let addAbstractReestr = query("Notaries.RegisterNotaries")
                .condition(
                    field("ApplicantFLFact.Surname").eq(mainOrder.Surname)
                    .and(field("ApplicantFLFact.Name").eq(mainOrder.Name))
                    .and(field("RegistrationNumber").eq(mainOrder.RegistrationNumber))
                ).consume();
            if (addAbstractReestr && addAbstractReestr.length) {
                addAbstractReestr.forEach(element => abstractReestr.push(element));
                abstractReestr = abstractReestr.filter(function (item, pos, array) {
                    return array.map(function (mapItem) {
                        return mapItem['objectId'];
                    }).indexOf(item['objectId']) === pos;
                });
            }
        }
    }
} else {
    error("Нет данных о сущности, в которой необходимо вести поиск");
}