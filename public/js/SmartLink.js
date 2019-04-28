require('../JSClipboard/JSClipboard.js');

/**
 *
 * Usage
 *
 let config = {
        pono: {
            menuOptions: {
                showParts: {
                    label: "Show PO Parts",
                    link: true,
                    linkAddress: function($smartLinkElement, instance) {
                        return "http://dev.amailonline.com/Stockcenter?partno=".concat(
                            $smartLinkElement.text().trim()
                        );
                    },
                    targetBlank: "true"
                },
                copy: {
                    label: "Copy PO",
                    onClick: function($smartLinkElement, instance, e) {
                        console.log("pono.copy.arguments:", arguments);
                        console.log("pono.copy.this (li):", this);
                        instance.copyText($smartLinkElement);
                    }
                }
            }
        },
        sono: {
            onClick($smartLinkElement, instance, e) {
                let $dropdownMenu = $smartLinkElement.$dropdownMenu;
                let dynamicOptionName = 'dynamic';
                let dynamicOptionConfig = {
                    label: "Dynamic Option",
                    onClick: function($smartLinkElement, instance, e) {
                        console.log("Doing dynamic stuff");
                    }
                };

                instance.addDynamicMenuItem($smartLinkElement, dynamicOptionName, dynamicOptionConfig)
            },
            menuOptions: {
                copy: {
                    label: "Copy SO",
                    onClick: function($smartLinkElement, instance, e) {
                        instance.copyText($smartLinkElement);
                    }
                },
                doSomething: {
                    label: "do Something",
                    link: true,
                    linkAddress: function($smartLinkElement, instance) {
                        return "http://dev.amailonline.com/Stockcenter?partno=".concat(
                            $smartLinkElement.text().trim()
                        );
                    },
                    targetBlank: "true"
                }
            }
        }
    };

 * var sLink = new SmartLink(config, new JSClipboard);
 * sLink.destroy();
 *
 */

const initSageProReportViewer = function (dialogRef, reportType, reportId) {
    let $modalContentIframe = dialogRef.getModalContent().find('iframe');

    $modalContentIframe.on('load', document, function (e) {
        let $thisIframe = $(this);

        $thisIframe.contents().find('#reportFormat').val('aqua_usd');
        $thisIframe.contents().find('#reportType').val(reportType);
        $thisIframe.contents().find('#reportId').val(reportId);

        window.setTimeout(function() {
            $thisIframe.contents().find('button[type="submit"]').click();
        }, 100);
    });
};

class SmartLink {
    constructor(scope = window, config = {}, clipboardHandler = new JSClipboard()) {
        let smartLinkSelector = '*[data-smart-link]', smartLinkTypeAttr = 'data-smart-link';

        // Set jQuery scope
        $ = scope.$;

        // Default clipboard handler
        this.clipboardHandler = {
            copy: function () {
                throw Error("SmartLink.clipboardHandler not provided!");
            }
        };

        // Default copy will show error on console if not defined
        if (typeof clipboardHandler !== "undefined") {
            this.clipboardHandler = clipboardHandler;
        }

        let copyMenuItem = () => ({
            label: "Copy",
            permissions: [],
            onClick: this.copyText.bind(this)
        });

        let commons = {
            orderPrecedence : {
                orderPrecedence : {
                    label: "Show Order Precedence",
                    onClick: function($smartLinkElement, instance, e) {
                        let params = {};
                        let smartlink = $smartLinkElement.data('smart-link');
                        params[smartlink] = $smartLinkElement.text().trim();
                        // console.log('top', window.top.location.href, window.top.location.href.indexOf("OrderPrecedenceReport"));
                        // console.log('parent', window.parent.location.href, window.parent.location.href.indexOf("OrderPrecedenceReport"));

                        // Check in already in OrderPrecedenceReport App then toggle Tab.
                        if(window.top.location.href.indexOf("OrderPrecedenceReport") > -1) {
                            if (window.top.Portal.EventBus) {
                                window.top.Portal.EventBus.$emit('LOAD_REPORT', params);
                            }
                        }
                        else if(window.parent.location.href.indexOf("OrderPrecedenceReport") > -1) {
                            let reportViewerDocument = $(window.parent.document);
                            $('input[type="text"]', reportViewerDocument).val("");
                            $("#"+smartlink, reportViewerDocument).val( params[smartlink] );
                            $("#viewReport", reportViewerDocument).trigger('click');
                        } else {
                            // Configure modal and show
                            let modalTitle = 'Order Precedence Report';
                            let iframeUrl = '/OrderPrecedenceReport/reportViewer?'.concat(Utilities.makeQueryString(params, true));

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: modalTitle,
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                      }
                    }
                }
            }
        };

        let defaultConfig = {
            userPermissions: localStorage.getItem('userPermissions') || [],
            credit_card: {
                menuOptions: {
                    copy: copyMenuItem(),
                    cardDetails: {
                        label: "Show Card Details",
                        link: true,
                        linkAddress($smartLinkElement, instance) {
                            let baseUrl = "/CreditCardManagementSystem?card_number=";
                            return baseUrl.concat($smartLinkElement.text().trim());
                        },
                        onClick: function ($sl, e) {
                            console.log(e);
                            e.preventDefault();
                        }
                    }
                }
            },
            custno: {
                menuOptions: {
                    copy: copyMenuItem(),
                    customerDetails: {
                        label: "Show Customer Details",
                        permissions: ['sales', 'purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let custno = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/CustomerDetail?custno='.concat(custno);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: custno.concat(' Customer Details'),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="customer-details-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    salesOverview: {
                        label: "Show Sales Overview",
                        onClick: function ($smartLinkElement, instance, e) {
                            let custno = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/SalesOverview?custno='.concat(encodeURIComponent(custno));

                            window.top.BootstrapDialog.show({
                                title: custno.concat(' &raquo; Sales Overview'),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="customer-sales-overview-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                                onshow: function(dialogRef) {
                                    dialogRef.$modalDialog.css({
                                        width: '800px',
                                    });

                                    dialogRef.$modalContent.css({
                                        height: '600px',
                                    });
                                },
                            });
                        }
                    },
                    ...commons.orderPrecedence
                }
            },
            salesmn: {
                menuOptions: {
                    copy: copyMenuItem(),
                    ...commons.orderPrecedence
                }
            },
            partNumber: {
                menuOptions: {
                    copy: copyMenuItem(),
                    details: {
                        label: "Show Details",
                        onClick: function ($smartLinkElement, instance, e) {
                            let partNumber = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/PartDetail?partNumber='.concat(encodeURIComponent(partNumber));
                    
                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Part Details for '.concat(partNumber),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="part-details-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    customers: {
                        label: "Show Customers",
                        onClick: function ($smartLinkElement, instance, e) {
                            let partNumber = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/CustomersForPart?partNumber='.concat(encodeURIComponent(partNumber));

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Customers for '.concat(partNumber),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="part-customers-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    vendors: {
                        label: "Show Vendors",
                        permissions: ['purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let partNumber = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/VendorsForPart?partNumber='.concat(encodeURIComponent(partNumber));

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Vendors for '.concat(partNumber),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="part-vendors-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    stockChart: {
                        label: "Show Stock Chart",
                        onClick: function ($smartLinkElement, instance, e) {
                            let partNumber = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/StockchartForPart?partNumber='.concat(encodeURIComponent(partNumber));

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Stock Chart for '.concat(partNumber),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="part-stock-chart-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    onlinePrices: {
                        label: "Show Online Vendor Prices",
                        onClick: function ($smartLinkElement, instance, e) {
                            let partNumber = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/OnlinePriceComparison?partNumber='.concat(encodeURIComponent(partNumber));

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Online Vendor Prices for '.concat(partNumber),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="online-vendor-prices-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    ...commons.orderPrecedence
                }
            },
            purno: {
                menuOptions: {
                    copy: copyMenuItem(),
                    poDetails: {
                        label: "Show PO Details",
                        permissions: ['logistics', 'purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let purno = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/PurchaseOrderInfo?searchField=purno&searchValue='.concat(purno);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'PO# '.concat(purno),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="purchase-order-info-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    printPreview: {
                        dividerBefore: true,
                        label: "Print Preview",
                        permissions: ['logistics', 'purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let purno = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/purchaseOrder?reportFormat=aqua_usd&reportType=purchaseOrder&reportId='.concat(purno);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'PO# '.concat(purno),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="purchase-order-print-preview-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                }
            },
            sono: {
                menuOptions: {
                    copy: copyMenuItem(),
                    soDetails: {
                        label: "Show SO Details",
                        onClick: function ($smartLinkElement, instance, e) {
                            let sono = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/SalesOrderInfo?searchField=sono&searchValue='.concat(sono);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'SO# '.concat(sono),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="sales-order-info-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    ...commons.orderPrecedence,
                    printPreview: {
                        dividerBefore: true,
                        label: "Print Preview",
                        onClick: function ($smartLinkElement, instance, e) {
                            let sono = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/salesOrder?reportFormat=aqua_usd&reportType=salesOrder&reportId='.concat(sono);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'SO# '.concat(sono),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="sales-order-print-preview-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                    printPackingSlip: {
                        label: "Print Packing Slip",
                        permissions: ['logistics'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let sono = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/packingSlip?sono='.concat(sono);
                            // let iframeUrl = '/SageProReports/packingSlipViewer?sono='.concat(sono);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'SO# '.concat(sono, ' &raquo; Packing Slip'),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="sales-order-packing-slip-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                                // onshown: function (dialogRef) {
                                //     let $modalContentIframe = dialogRef.getModalContent().find('iframe');
                                //
                                //     $modalContentIframe.on('load', document, function (e) {
                                //         let $thisIframe = $(this);
                                //
                                //         $thisIframe.contents().find('#sono').val(sono);
                                //         $thisIframe.contents().find('button[type="submit"]').click();
                                //     });
                                // },
                            });
                        }
                    },
                    printPackingLabel: {
                        label: "Print Packing Label",
                        permissions: ['logistics'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let sono = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/packingLabelViewer?sono='.concat(sono);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'SO# '.concat(sono, ' &raquo; Packing Label'),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="sales-order-packing-label-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                                onshown: function (dialogRef) {
                                    let $modalContentIframe = dialogRef.getModalContent().find('iframe');

                                    $modalContentIframe.on('load', document, function (e) {
                                        let $thisIframe = $(this);

                                        $thisIframe.contents().find('#sono').val(sono);
                                        $thisIframe.contents().find('button[type="submit"]').click();
                                    });
                                },
                            });
                        }
                    },
                }
            },
            vendno: {
                menuOptions: {
                    copy: copyMenuItem(),
                    customerDetails: {
                        label: "Show Vendor Details",
                        permissions: ['purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let custno = $smartLinkElement.text().trim();
                            let iframeUrl = '/Widget/VendorDetail?vendno='.concat(custno);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: custno.concat(' Vendor Details'),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="vendor-details-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    }
                }
            },
            invno: {
                menuOptions: {
                    copy: copyMenuItem(),
                    invoiceDetails: {
                        label: "Show Details",
                        onClick: function ($smartLinkElement, instance, e) {
                            let invno = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/reportViewer';

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Invoice # '.concat(invno),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="sales-invoice-info-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                                onshown: function (dialogRef) {
                                    initSageProReportViewer(dialogRef, 'salesInvoice', invno);
                                },
                            });
                        }
                    },
                    printPreview: {
                        dividerBefore: true,
                        label: "Print Preview",
                        permissions: ['sales', 'purchasing'],
                        onClick: function ($smartLinkElement, instance, e) {
                            let invno = $smartLinkElement.text().trim();
                            let iframeUrl = '/SageProReports/salesInvoice?reportFormat=aqua_usd&reportType=salesInvoice&reportId='.concat(invno);

                            window.top.BootstrapDialog.show({
                                size: 'size-wide',
                                title: 'Invoice # '.concat(invno),
                                cssClass: 'bootstrap-dialog-custom',
                                message: `<iframe name="invoice-print-preview-iframe" style="width: 100%;height: 630px;border: 0;" src="${iframeUrl}"></iframe>`,
                            });
                        }
                    },
                }
            },
        };

        let mergedConfig = $.extend(true, defaultConfig, config);

        $(smartLinkSelector).each(function (i, smartLinkElement) {
            let smartLinkType = $(smartLinkElement).attr(smartLinkTypeAttr);

            if (!mergedConfig.hasOwnProperty(smartLinkType)) {
                mergedConfig[smartLinkType] = {
                    menuOptions: {
                        copy: copyMenuItem()
                    }
                };
            }
        });

        this.config = mergedConfig;
        this.init();
    }

    init() {
        let thisClass = this;

        $("*[data-smart-link]").each(function (i, smartLinkElement) {
            let $smartLinkElement = $(smartLinkElement);

            // Skip applying smart link if already applied
            if (!$smartLinkElement.parent().hasClass('smart-link-wrapper')) {
                thisClass.applySmartLink($smartLinkElement, i);
            }
        });
    }

    // Remove SmartLink from all options.
    destroy() {
        let thisClass = this;
        $("*[data-smart-link]").each(function (i, smartLinkElement) {
            try {
                thisClass.removeSmartLink($(smartLinkElement));
            } catch (err) {
                console.error(err, smartLinkElement);
            }
        });
    }

    // Apply SmartLink to each element
    applySmartLink($smartLinkElement, index) {
        //let $smartLinkElement = $(smartLinkElement);
        let type = $smartLinkElement.data("smart-link");

        if (typeof this.config[type] !== "undefined") {
            // Call onClick() if defined
            if (typeof this.config[type]["onClick"] === "function") {
                $smartLinkElement
                    .get(0)
                    .addEventListener(
                        "click",
                        this.config[type].onClick.bind(
                            this.config[type],
                            $smartLinkElement,
                            (instance = this)
                        )
                    );
            }

            // Wraping with smartlink parent div.
            var wrapper = this.wrap($smartLinkElement);
            var dropdown = this.createDropDown(
                $smartLinkElement,
                this.config[type].menuOptions
            );

            if (dropdown) {
                // Append the dropdown to wrapper.
                wrapper.append(dropdown);

                // Add datatoggle attribute to this element
                $smartLinkElement.attr("data-toggle", "dropdown");

                // Add smartlink class
                $smartLinkElement.addClass("smart-link");

                // Change dropdown position according to nearest scrollable parent.
                wrapper.on("shown.bs.dropdown", function (e) {
                    let $dropdownBtn = $(this).children("[data-toggle='dropdown']");
                    let $dropdownMenu = $(this).children(".dropdown-menu");

                    Utilities.dropDownFixPosition($dropdownBtn, $dropdownMenu);
                });
            }
        }

        return $smartLinkElement;
    }

    // Remove SmartLink from each links.
    removeSmartLink($smartLinkElement) {
        // Check if its a smartlink.
        if ($smartLinkElement.parent().is(".smart-link-wrapper")) {
            // Remove dropdown.
            $smartLinkElement.siblings().detach();

            // Remove wrapper.
            $smartLinkElement.unwrap();

            // Remove class.
            $smartLinkElement.removeClass("smart-link");
        } else {
            throw "Trying to destroy a non SmartLink.";
        }
    }

    // Wrap the smartlink and return the wraper.
    wrap($smartLinkElement) {
        return $smartLinkElement
            .wrap($("<div class='smart-link-wrapper' title='Click to see available smart link actions'></div>"))
            .parent();
    }

    // Add dropdown and return the dropdown.
    createDropDown($smartLinkElement, menuOptions) {
        let thisClass = this;
        let dropdown = $("<ul class='dropdown-menu'></ul>");

        $smartLinkElement.$dropdownMenu = dropdown;

        // Create options
        Object.keys(menuOptions).forEach(function (optionName) {
            // Check permissions before adding options to menu
            let permissions = menuOptions[optionName].permissions || [];
            let userPermissions = thisClass.config.userPermissions;
            let userHasPermissions = false;

            // Only check permissions for non-admin users
            if (userPermissions.indexOf('admin') !== -1 || permissions.length == 0) {
                userHasPermissions = true;
            }
            else {
                // Only check permissions if menu option has permissions
                for (var i = 0; i < permissions.length; i++) {
                    // Check if menu option permissions are in the user's permissions list
                    if (userPermissions.indexOf(permissions[i]) !== -1) {
                        userHasPermissions = true;
                        break;
                    }
                }
            }

            let liTag = thisClass.createOption(
                $smartLinkElement,
                menuOptions[optionName],
                optionName,
                userHasPermissions,
            );

            // @TODO Uncomment for production
            // if (liTag && userHasPermissions) {
            if (liTag) {
                if (menuOptions[optionName]['dividerBefore']) {
                    dropdown.append('<li class="divider"></li>');
                }
                dropdown.append(liTag);
            }
        });
        if (dropdown.children().length == 0) {
            return false;
        }

        return dropdown;
    }

    // Create individual option in dropdown and add event listeners
    createOption($smartLinkElement, option, optionName, userHasPermissions = false) {
        try {
            let instance = this;
            var aTag = $("<a target='_blank'>" + option.label + "</a>");

            //  Add href top open link
            if (option.link) {
                if (typeof option.linkAddress == "function") {
                    aTag.attr("href", option.linkAddress($smartLinkElement, instance));
                } else {
                    aTag.attr("href", option.linkAddress);
                }
            }

            //  Change target if available
            if (option.target) {
                aTag.attr("target", option.target);
            }

            // Add classes
            aTag.addClass(option.classes);

            // Wrap and return the container li tag.
            let liTag = aTag.wrap(`<li class="smart-link-menu-item" data-option-name="${optionName}"></li>`).parent();
            liTag.attr('title', '');

            if (typeof option.onClick === "function" && userHasPermissions) {
                liTag
                    .get(0)
                    .addEventListener(
                        "click",
                        option.onClick.bind(liTag.get(0), $smartLinkElement, instance)
                    );
            }

            // Disable this item if user doesn't have permissions
            if (!userHasPermissions) {
                // console.info('Disabling menu option:', optionName);
                liTag.attr('title', 'Sorry, you do not have permissions to perform this operation');
                liTag.addClass('disabled');
                liTag.find('a').prop("disabled", true);
            }

            return liTag;

        } catch (err) {
            console.error("Error creating option:" + option.label + " \r\n" + err);
            return false;
        }
    }

    // Copy the text inside the element.
    copyText($smartLinkElement) {
        this.clipboardHandler.copy($smartLinkElement.text().trim());
    }

    addDynamicMenuItem($smartLinkElement, dynamicOptionName, dynamicOptionConfig) {
        // console.log("addDynamicMenuItem() triggered on:", $smartLinkElement);
        // console.log(
        //     "$smartLinkElement.$dropdownMenu",
        //     $smartLinkElement.$dropdownMenu
        // );

        let $dropdownMenu = $smartLinkElement.$dropdownMenu;
        $smartLinkElement.menuOptions = $dropdownMenu.menuOptions;

        if ($dropdownMenu.find(`.smart-link-menu-item[data-option-name="${dynamicOptionName}"]`).length == 0) {
            //$smartLinkElement.menuOptions[dynamicOptionName] = dynamicOptionConfig;

            var liTag = instance.createOption(
                $smartLinkElement,
                dynamicOptionConfig,
                dynamicOptionName
            );
            if (liTag) {
                $dropdownMenu.append(liTag);
            }
        }
    }
}

window.SmartLink = SmartLink;

// SmartLink jQuery helper plugin
window.jQuery.fn.smartLink = function (smartLinkType) {
    let $smartLink = $(this).wrapInner(`<span data-smart-link="${smartLinkType}"></span>`);

    new window.SmartLink();

    return $smartLink;
};

export default SmartLink;