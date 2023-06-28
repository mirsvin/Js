//Инициализация

(() => {
    info("Start [ФНС][Подпроцесс] Подготовка ТК");
    function generateUUIDFile(nameFile, typeFile) {
        let idFile = getRandom().match(/[a-zA-Z0-9]/g).join('');
        return [nameFile + "_" + idFile + typeFile, idFile];
    }
    // получили данные распоряжения
    filesFromOrder = [];
    reestrOrder = order;
    let explandServiceType = getObject("ExpandService.ExpandServiceType", {
            "identifier": order.ServiceType.identifier,
        }),
        permissionFile = null;
    if (explandServiceType) {
        if (order.Accreditation) {
            permissionFile = order.Accreditation.AccreditatDoc;
        } else if (order.Cancellation) {
            permissionFile = order.Cancellation.CancellatDoc;
        }
        if (permissionFile) {
            let nameDecisionMinjust = generateUUIDFile("ReshMinust", ".pdf");
            let reshMinust = createObject("FNSIntegration.AdditionalFiles", {
                "NameFile": nameDecisionMinjust[0],
                "OriginalNameFile": getFileName(permissionFile),
                "idFile": nameDecisionMinjust[1],
                "TypeAttachedDoc": getObject("FNSIntegration.TypeAttachedDoc", {
                    "CodeSVDREG": "040011"
                }),
                "FileAdditional": permissionFile,
            });
            updateFileName(String(permissionFile), String(nameDecisionMinjust[0]));
            filesFromOrder.push(reshMinust);
        }
    }

    // обработали оставшиеся документы
    let entityAttributes = __uml.getAttributes(order.entitySpecId);
    for (let i = 0, entityAttributesLength = entityAttributes.size(); i < entityAttributesLength; i++) {
        let nameAttr = entityAttributes.get(i).getName();
        if (entityAttributes.get(i).getType() == "file" && !!order[nameAttr]) {
            let recordForAdditional = createObject("FNSIntegration.AdditionalFiles", {
                    "OriginalNameFile": getFileName(order[nameAttr]),
                    "FileAdditional": order[nameAttr],
                }),
                updateNamFile = null;
            if (['FounderDecision', 'MinutesFoundingCongressDoc', 'DecisionFoundCongressDoc', 'CreateBranchDecision'].includes(nameAttr)) {
                recordForAdditional.TypeAttachedDoc = getObject("FNSIntegration.TypeAttachedDoc", {
                    "CodeSVDREG": "021023"
                });
                updateNamFile = generateUUIDFile("PrilozhDokum", ".pdf");
                recordForAdditional.NameFile = updateNamFile[0];
                recordForAdditional.idFile = updateNamFile[1];
                updateFileName(String(order[nameAttr]), String(updateNamFile[0]));
            } else {
                recordForAdditional.TypeAttachedDoc = getObject("FNSIntegration.TypeAttachedDoc", {
                    "CodeSVDREG": "020002",
                });
                updateNamFile = generateUUIDFile(recordForAdditional.TypeAttachedDoc.Abbreviation, ".pdf");
                recordForAdditional.NameFile = updateNamFile[0];
                recordForAdditional.idFile = updateNamFile[1];
                updateFileName(String(order[nameAttr]), String(updateNamFile[0]));
            }
            filesFromOrder.push(recordForAdditional);
        }
    }
    action = getObject("Dictionaries.SprAppealActions", {
        "Code": "SendSigning"
    });
    userOrerator = order.Performer;
})();


//Обработка отправленных документов
(() => {
    function generateUUIDFile(nameFile, typeFile) {
        let idFile = getRandom().match(/[a-zA-Z0-9]/g).join('');
        return [nameFile + "_" + idFile + typeFile, idFile];
    }
    arrFilesToSign = [];
    for (let elem = 0; elem < additionalFiles.length; elem++) {
        additionalFiles[elem].OriginalNameFile = getFileName(additionalFiles[elem].FileAdditional);
        let nameElem = generateUUIDFile(additionalFiles[elem].TypeAttachedDoc.Abbreviation, ".pdf");
        additionalFiles[elem].NameFile = nameElem[0];
        additionalFiles[elem].idFile = nameElem[1];
        updateFileName(String(additionalFiles[elem].FileAdditional), String(nameElem[0]));
        arrFilesToSign.push(additionalFiles[elem].FileAdditional);
    }
    for (let elem = 0; elem < filesFromOrder.length; elem++) {
        arrFilesToSign.push(filesFromOrder[elem].FileAdditional);
        additionalFiles.push(filesFromOrder[elem]);
    }
    idFileOpis = getRandom().match(/[a-zA-Z0-9]/g).join('');
})();
arrFileForFNS = [];
arrFileForFNS.push(arrFilesToSign);