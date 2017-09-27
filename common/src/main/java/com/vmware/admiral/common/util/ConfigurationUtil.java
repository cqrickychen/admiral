/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 *
 * This product is licensed to you under the Apache License, Version 2.0 (the "License").
 * You may not use this product except in compliance with the License.
 *
 * This product may include a number of subcomponents with separate copyright notices
 * and license terms. Your use of these subcomponents is subject to the terms and
 * conditions of the subcomponent's license, as noted in the LICENSE file.
 */

package com.vmware.admiral.common.util;

import com.vmware.admiral.service.common.ConfigurationService.ConfigurationState;

// TODO - Remove/refactor this class since it may introduce some inconsistent behavior.
// See comments below.
public class ConfigurationUtil {

    public static final String UI_PROXY_FORWARD_HEADER = "x-forwarded-for";
    private static final String EMBEDDED_MODE_PROPERTY = "embedded";

    private static ConfigurationState[] configProperties;

    /**
     * Initializes the cache of configuration property values. See {@link #getProperty(String)}.
     */
    @Deprecated
    public static void initialize(ConfigurationState... cs) {
        configProperties = cs;
    }

    /**
     * Retrieves the property value from a cache loaded with, a priori, the same configuration
     * properties files values.
     *
     * The value of the property will be valid as long as:
     * - It is not updated at runtime (the configuration state will be updated, this cache no).
     * - (in cluster) All the nodes start with the same configuration properties files and their
     * corresponding values.
     */
    @Deprecated
    public static String getProperty(String propertyName) {
        if (configProperties == null || propertyName == null) {
            return null;
        }
        for (ConfigurationState config : configProperties) {
            if (propertyName.equals(config.key)) {
                return config.value;
            }
        }

        return null;
    }

    /**
     * Returns whether Admiral is running on embedded mode or not based on the "embedded"
     * configuration property.
     */
    public static boolean isEmbedded() {
        return Boolean.valueOf(ConfigurationUtil.getProperty(EMBEDDED_MODE_PROPERTY));
    }

}
