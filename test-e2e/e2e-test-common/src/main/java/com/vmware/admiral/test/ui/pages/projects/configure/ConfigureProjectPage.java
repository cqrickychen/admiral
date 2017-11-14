/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 *
 * This product is licensed to you under the Apache License, Version 2.0 (the "License").
 * You may not use this product except in compliance with the License.
 *
 * This product may include a number of subcomponents with separate copyright notices
 * and license terms. Your use of these subcomponents is subject to the terms and
 * conditions of the subcomponent's license, as noted in the LICENSE file.
 */

package com.vmware.admiral.test.ui.pages.projects.configure;

import static com.codeborne.selenide.Selenide.$;

import java.util.Objects;

import org.openqa.selenium.By;

import com.vmware.admiral.test.ui.pages.common.BasicPage;
import com.vmware.admiral.test.ui.pages.main.GlobalSelectors;

public class ConfigureProjectPage
        extends BasicPage<ConfigureProjectPage, ConfigureProjectPageValidator> {

    private final By BACK_BUTTON = By.xpath(
            "html/body/my-app/clr-main-container/div/app-administration/div/app-projects/navigation-container/div/back-button/a/span");
    private final By SUMMARY_BUTTON = By.cssSelector("#summaryTab .btn");
    private final By MEMBERS_BUTTON = By.cssSelector("#membersTab .btn");

    private ConfigureProjectPageValidator validator;
    private SummaryTab summaryTab;
    private MembersTab membersTab;

    public SummaryTab navigateToSummaryTab() {
        $(SUMMARY_BUTTON).click();
        if (Objects.isNull(summaryTab)) {
            summaryTab = new SummaryTab();
        }
        return summaryTab;
    }

    public MembersTab navigateToMembersTab() {
        $(MEMBERS_BUTTON).click();
        if (Objects.isNull(membersTab)) {
            membersTab = new MembersTab();
        }
        return membersTab;
    }

    public void navigateBack() {
        $(BACK_BUTTON).click();
        waitForElementToAppearAndDisappear(GlobalSelectors.SPINNER);
    }

    @Override
    public ConfigureProjectPageValidator validate() {
        if (Objects.isNull(validator)) {
            validator = new ConfigureProjectPageValidator();
        }
        return validator;
    }

    @Override
    public ConfigureProjectPage getThis() {
        return this;
    }

}