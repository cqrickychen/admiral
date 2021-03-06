/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 *
 * This product is licensed to you under the Apache License, Version 2.0 (the "License").
 * You may not use this product except in compliance with the License.
 *
 * This product may include a number of subcomponents with separate copyright notices
 * and license terms. Your use of these subcomponents is subject to the terms and
 * conditions of the subcomponent's license, as noted in the LICENSE file.
 */

import ContainersViewVue from 'components/containers/ContainersViewVue.html';
import ContainersListItem from 'components/containers/ContainersListItem'; //eslint-disable-line
import ClosureListItem from 'components/containers/ClosureListItem'; //eslint-disable-line
import ClusterContainersListItem from 'components/containers/cluster/ClusterContainersListItem';  //eslint-disable-line
import CompositeContainersListItem from 'components/containers/composite/CompositeContainersListItem'; //eslint-disable-line
import CompositeClosuresListItem from 'components/containers/closure/CompositeClosuresListItem'; //eslint-disable-line
import ProjectsListItem from 'components/projects/ProjectsListItem'; //eslint-disable-line
import NetworksListItem from 'components/networks/NetworksListItem'; //eslint-disable-line
import VolumesListItem from 'components/volumes/VolumesListItem'; //eslint-disable-line
import ContainerDetails from 'components/containers/ContainerDetails';//eslint-disable-line
import ClosureDetails from 'components/containers/ClosureDetails';//eslint-disable-line
import ClusterContainerDetails from 'components/containers/cluster/ClusterContainerDetails';//eslint-disable-line
import CompositeContainerDetails from 'components/containers/composite/CompositeContainerDetails';//eslint-disable-line
import CompositeClosuresDetails from 'components/containers/closure/CompositeClosuresDetails';//eslint-disable-line
import RequestsList from 'components/requests/RequestsList';//eslint-disable-line
import EventLogList from 'components/eventlog/EventLogList';//eslint-disable-line
import ProjectRequestForm from 'components/projects/ProjectRequestForm';
import ClosureRequestForm from 'components/closures/ClosureRequestForm';
import ContainerRequestForm from 'components/containers/ContainerRequestForm';
import NetworkRequestForm from 'components/networks/NetworkRequestForm';
import VolumeRequestForm from 'components/volumes/VolumeRequestForm';
import KubernetesRequestForm from 'components/kubernetes/KubernetesRequestForm';
import VueAdapter from 'components/common/VueAdapter';
import GridHolderMixin from 'components/common/GridHolderMixin';
import constants from 'core/constants';
import utils from 'core/utils';
import ft from 'core/ft';
import { NavigationActions, RequestsActions, NotificationsActions, ContainerActions,
         ContainersContextToolbarActions } from 'actions/Actions';

var ContainersViewVueComponent = Vue.extend({
  template: ContainersViewVue,
  props: {
    model: {
      required: true,
      type: Object,
      default: () => {
        return {
          listView: {},
          contextView: {}
        };
      }
    }
  },
  computed: {
    hasItems: function() {
      return this.model.listView.items && this.model.listView.items.length > 0;
    },
    titleSearch: function() {
      return i18n.t('app.resource.list.titleSearch.' + this.selectedCategory);
    },
    placeholderByCategoryMap: function() {
      return {
        'projects': i18n.t('app.resource.list.searchPlaceholder.projects'),
        'containers': i18n.t('app.resource.list.searchPlaceholder.containers'),
        'applications': i18n.t('app.resource.list.searchPlaceholder.applications'),
        'networks': i18n.t('app.resource.list.searchPlaceholder.networks'),
        'closures': i18n.t('app.resource.list.searchPlaceholder.closures'),
        'volumes': i18n.t('app.resource.list.searchPlaceholder.volumes'),
        'kubernetes': i18n.t('app.resource.list.searchPlaceholder.kubernetes')
      };
    },
    hasContainerDetailsError: function() {
      return this.model.selectedItemDetails &&
        this.model.selectedItemDetails.error && this.model.selectedItemDetails.error._generic;
    },
    hasResourceCreateError: function() {
      return this.model.creatingResource && this.model.creatingResource.error
        && this.model.creatingResource.error._generic;
    },
    containerDetailsError: function() {
      return this.hasContainerDetailsError ? this.model.selectedItemDetails.error._generic : '';
    },
    resourceCreateError: function() {
      return this.hasResourceCreateError ? this.model.creatingResource.error._generic : '';
    },
    showContextPanel: function() {
      var selectedItemDetails = this.model.selectedItemDetails;
      if (!selectedItemDetails) {
        // nothing is selected to view its details
        return true;
      }
      while (selectedItemDetails.selectedItemDetails) {
        // composite/cluster item has been selected for details viewing
        selectedItemDetails = selectedItemDetails.selectedItemDetails;
      }

      return selectedItemDetails.type !== constants.CONTAINERS.TYPES.SINGLE;
    },
    activeContextItem: function() {
      return this.model.contextView && this.model.contextView.activeItem &&
        this.model.contextView.activeItem.name;
    },
    contextExpanded: function() {
      return this.model.contextView && this.model.contextView.expanded;
    },
    queryOptions: function() {
      return this.model.listView && this.model.listView.queryOptions;
    },
    selectedCategory: function() {
      var queryOpts = this.queryOptions || {};

      return queryOpts[constants.SEARCH_CATEGORY_PARAM]
              || constants.CONTAINERS.SEARCH_CATEGORY.CONTAINERS;
    },
    searchPlaceholder: function() {
      return this.placeholderByCategoryMap[this.selectedCategory];
    },
    selectedItemDocumentId: function() {
      return this.model.selectedItem && this.model.selectedItem.documentId;
    },
    requestsCount: function() {
      var contextView = this.model.contextView;
      if (contextView && contextView.notifications) {
        return contextView.notifications.requests;
      }
      return 0;
    },
    eventLogsCount: function() {
      var contextView = this.model.contextView;
      if (contextView && contextView.notifications) {
        return contextView.notifications.eventlogs;
      }
      return 0;
    },
    creatingOrUpdatingProject: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.PROJECTS;
    },
    updatingProject: function() {
      return this.model.creatingResource &&
        this.model.creatingResource.documentSelfLink &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.PROJECTS;
    },
    creatingContainer: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.CONTAINERS;
    },
    creatingNetwork: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.NETWORKS;
    },
    creatingVolume: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.VOLUMES;
    },
    creatingKubernetes: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.KUBERNETES;
    },
    searchSuggestions: function() {
      return this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.PROJECTS ?
        constants.RESOURCES.PROJECTS.SEARCH_SUGGESTIONS :
        constants.CONTAINERS.SEARCH_SUGGESTIONS;
    },
    searchSuggestionsByCategoryMap: function() {
      return {
        'projects': constants.RESOURCES.PROJECTS.SEARCH_SUGGESTIONS,
        'containers': constants.CONTAINERS.SEARCH_SUGGESTIONS,
        'applications': constants.RESOURCES.APPLICATIONS.SEARCH_SUGGESTIONS,
        'networks': constants.RESOURCES.NETWORKS.SEARCH_SUGGESTIONS,
        'closures': constants.CLOSURES.SEARCH_SUGGESTIONS,
        'volumes': constants.RESOURCES.VOLUMES.SEARCH_SUGGESTIONS,
        'kubernetes': constants.RESOURCES.KUBERNETES.SEARCH_SUGGESTIONS
      };
    },
    creatingClosure: function() {
      return this.model.creatingResource &&
        this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.CLOSURES;
    },
    areClosuresAllowed: function() {
      return ft.areClosuresAllowed();
    }
  },
  data: function() {
    return {
      constants: constants,
      // this view behaves better if the target width is set before the width transition
      requiresPreTransitionWidth: true,
      selectionMode: false,
      selectedItems: [],
      containerConnectedAlerts: [],
      managedByCatalogAlerts: [],
      lastSelectedItemId: null
    };
  },
  mixins: [GridHolderMixin],
  attached: function() {
    var $mainPanel = $(this.$el).children('.list-holder').children('.main-panel');

    $mainPanel.on('transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd',
      (e) => {
        if (e.target === $mainPanel[0]) {
          this.unsetPostTransitionGridTargetWidth();
        }
      }
    );

    this.unwatchExpanded = this.$watch('contextExpanded', () => {
      Vue.nextTick(() => {
        this.setPreTransitionGridTargetWidth($mainPanel);
      });
    });

    if (ft.allowHostEventsSubscription()) {
      this.refreshContainersInterval = setInterval(() => {
        if (!this.model.rescanningContainer && !this.model.rescanningApplicationContainers) {
          ContainerActions.rescanContainers(this.queryOptions);
        }
      }, utils.getContainersRefreshInterval());

      if (!this.startRefreshPollingTimeout) {
        this.startRefreshPollingTimeout = setTimeout(
          () => this.refreshContainersInterval, constants.CONTAINERS.START_REFRESH_POLLING_DELAY);
      }
    }

    this.refreshRequestsInterval = setInterval(() => {
      if (this.activeContextItem === constants.CONTEXT_PANEL.REQUESTS) {
        RequestsActions.refreshRequests();
      }
    }, constants.REQUESTS.REFRESH_INTERVAL);

    this.notificationsInterval = setInterval(() => {
      if (!this.contextExpanded && utils.isContainersTabOpened()) {
        NotificationsActions.retrieveNotifications();
      }
    }, constants.NOTIFICATIONS.REFRESH_INTERVAL);

    this.unwatchSelectedCategory = this.$watch('selectedCategory',
      (oldSelectedCategory, selectedCategory) => {

        if (oldSelectedCategory !== selectedCategory) {
          this.clearSelections();
        }
      }, {immediate: true});
  },

  detached: function() {
    this.unwatchExpanded();

    var $mainPanel = $(this.$el).children('.list-holder').children('.main-panel');
    $mainPanel.off('transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd');

    if (ft.allowHostEventsSubscription()) {
      clearTimeout(this.startRefreshPollingTimeout);
      this.startRefreshPollingTimeout = null;
      clearInterval(this.refreshContainersInterval);
      this.refreshContainersInterval = null;
    }

    ContainerActions.closeContainers();

    clearInterval(this.refreshRequestsInterval);
    clearInterval(this.notificationsInterval);

    this.unwatchSelectedCategory();
  },

  methods: {
    goBack: function() {
      NavigationActions.openContainers(this.queryOptions);
    },

    goBackFromProjects: function() {
      if (this.updatingProject) {
        ContainerActions.openContainers(this.queryOptions);
      } else {
        this.goBack();
      }
    },

    goBackFromClosures: function() {
        ContainerActions.openContainers({
          '$category': 'closures'
        }, true);
    },

    search: function(queryOptions) {

      this.doSearchAndFilter(queryOptions, this.selectedCategory);
    },

    selectCategory(categoryName, $event) {
      this.doSearchAndFilter(this.queryOptions, categoryName);
      $event.stopPropagation();
      $event.preventDefault();
    },

    doSearchAndFilter: function(queryOptions, categoryName) {
      var queryOptionsToSend = $.extend({}, queryOptions);
      queryOptionsToSend[constants.SEARCH_CATEGORY_PARAM] = categoryName;

      NavigationActions.openContainers(queryOptionsToSend);
    },

    openContainerDetails: function(documentId) {
      NavigationActions.openContainerDetails(documentId);
    },

    openClosureDetails: function(documentId) {
      NavigationActions.openClosureDetails(documentId);
    },

    openClusterDetails: function(clusterId) {
      NavigationActions.openClusterDetails(clusterId);
    },

    openCompositeContainerDetails: function(documentId) {
      NavigationActions.openCompositeContainerDetails(documentId);
    },

    openClosureDescriptionDetails: function(documentId) {
      NavigationActions.openCompositeClosureDetails(documentId);
    },

    openCreateContainer: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewContainer();
    },

    openCreateApplication: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewApplication();
    },

    openCreateNetwork: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewNetwork();
    },

    openCreateVolume: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewVolume();
    },

    openCreateProject: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewProject();
    },

    openCreateClosure: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewClosure();
    },

    openCreateKubernetes: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      return NavigationActions.openCreateNewKubernetes();
    },

    refresh: function() {
      ContainerActions.openContainers(this.queryOptions, true);
    },

    loadMore: function() {
      if (this.model.listView.nextPageLink) {
        ContainerActions.openContainersNext(this.queryOptions,
                                            this.model.listView.nextPageLink);
      } else if (this.hasItems && (this.itemsCount > this.model.listView.items.length)) {
        console.warn('No next page link available, cannot load next items.',
                      ' Loaded items count', this.model.listView.items.length,
                      ' Total count ', this.itemsCount);
      }
    },

    multiSelectionSupported: function() {
      return this.hasItems
       && this.selectedCategory !== constants.RESOURCES.SEARCH_CATEGORY.CLOSURES
       && this.selectedCategory !== constants.RESOURCES.SEARCH_CATEGORY.PROJECTS;
    },

    multiSelectionOperationSupported: function(operation) {
      if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.CONTAINERS
          || this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.APPLICATIONS) {
        return true;
      } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.NETWORKS) {
        return operation === constants.RESOURCES.NETWORKS.OPERATION.REMOVE;
      } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.VOLUMES) {
        return operation === constants.RESOURCES.VOLUMES.OPERATION.REMOVE;
      }

      return false;
    },

    clearSelections: function() {
      // hide day2 ops bar
      $(this.$el).find('.title-second-day-operations').addClass('hide');
      // clear data
      this.selectionMode = false;
      this.selectedItems = [];
      this.lastSelectedItemId = null;

      // un-mark items
      $(this.$el).find('.grid-item').removeClass('marked');

        // clear the warnings list. This needs to be done on the 'next tick', otherwise
        // watchers will not see the change.
        let _this = this;
        this.$nextTick(() => {
          _this.containerConnectedAlerts = [];
          _this.managedByCatalogAlerts = [];
        });

    },

    toggleSelectionMode: function() {
      this.selectionMode = !this.selectionMode;
      if (this.selectionMode) {
        $(this.$el).find('.title-second-day-operations').removeClass('hide');
      } else {
        this.clearSelections();
      }
    },

    isMarked: function(item) {
      return !item.system && this.selectedItems.indexOf(item.documentId) > -1;
    },

    performDeleteBatchOperation: function() {
      if (this.selectedCategory === constants.CONTAINERS.SEARCH_CATEGORY.CONTAINERS
          || this.selectedCategory === constants.CONTAINERS.SEARCH_CATEGORY.APPLICATIONS) {
        this.deselectCatalogItems();

        this.performBatchOperation('Container.Delete');

      } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.NETWORKS) {
        this.deselectCatalogItems();
        this.deselectUnsupportedRemoval();

        this.performBatchOperation('Network.Delete');

      } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.VOLUMES) {
        this.deselectCatalogItems();
        this.deselectUnsupportedRemoval();

        this.performBatchOperation('Volume.Delete');

      } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.CLOSURES) {
        this.performBatchOperation('Closure.Delete');
      }
    },

    hasManagedByCatalogAlert: function(documentId) {
      return this.managedByCatalogAlerts && this.managedByCatalogAlerts.indexOf(documentId) > -1;
    },

    hasContainersConnectedAlert: function(documentId) {
      return this.containerConnectedAlerts
                && this.containerConnectedAlerts.indexOf(documentId) > -1;
    },

    deselectUnsupportedRemoval: function() {
      // deselect and show warnings for the selected items not supporting deletion

      this.model.listView.items.forEach((item) => {

        let index = this.selectedItems ? this.selectedItems.indexOf(item.documentId) : -1;

        // if this item is selected
        if (index > -1) {
          if (!utils.canRemove(item)) {

            // show alert
            utils.pushNoDuplicates(this.containerConnectedAlerts, item.documentId);

            // remove item from selection
            this.selectedItems.splice(index, 1);
          }
        }
      });

    },

    deselectCatalogItems: function() {
      this.model.listView.items.forEach((item) => {

        let index = this.selectedItems ? this.selectedItems.indexOf(item.documentId) : -1;

        // if this item is selected
        if (index > -1) {
          // if manage operation is supported, then an alert is displayed
          if (utils.operationSupported(constants.CONTAINERS.OPERATION.MANAGE, item)) {

            // show alert
            utils.pushNoDuplicates(this.managedByCatalogAlerts, item.documentId);

            // remove item from selection
            this.selectedItems.splice(index, 1);
          }
        }
      });

    },

    performBatchOperation: function(operation) {
      let selectedItemIds = this.selectedItems;
      this.clearSelections();

      if (selectedItemIds && selectedItemIds.length > 0) {

        if (this.selectedCategory === constants.CONTAINERS.SEARCH_CATEGORY.CONTAINERS) {
          ContainerActions.batchOpContainers(selectedItemIds, operation);
        } else if (this.selectedCategory === constants.CONTAINERS.SEARCH_CATEGORY.APPLICATIONS) {

          ContainerActions.batchOpCompositeContainers(selectedItemIds, operation);
        } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.NETWORKS) {

          ContainerActions.batchOpNetworks(selectedItemIds, operation);
        } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.VOLUMES) {

          ContainerActions.batchOpVolumes(selectedItemIds, operation);
        } else if (this.selectedCategory === constants.RESOURCES.SEARCH_CATEGORY.CLOSURES) {

          ContainerActions.batchOpClosures(selectedItemIds, operation);
        }
      }
    },

    handleItemClick: function($event, item, defaultFn) {
      let itemId = item.documentId;

      if (!this.selectionMode) {
        // standard flow
        if (defaultFn) {
          defaultFn.call(this, itemId);
        }

      } else {
        // selection of items
        $event.stopPropagation();

        if (item.system) {
          // no day 2 ops on system containers
          return;
        }

        let $gridItemEl = $($event.target).closest('.grid-item');
        let wasSelected = $gridItemEl.hasClass('marked');

        if (!wasSelected) {
          $gridItemEl.addClass('marked');
        } else {
          $gridItemEl.removeClass('marked');
        }

        let isSelected = !wasSelected;
        if (isSelected) {
          // add to selected items
          utils.pushNoDuplicates(this.selectedItems, itemId);

          if ($event.shiftKey && this.lastSelectedItemId) {

            let startIndex = this.model.listView.items.findIndex((item) => {
              return item.documentId === this.lastSelectedItemId;
            });
            let lastIndex = this.model.listView.items.findIndex((item) => {
              return item.documentId === itemId;
            });

            if (startIndex > lastIndex) {
              // backwards selection
              let tmp = startIndex;
              startIndex = lastIndex;
              lastIndex = tmp;
            }

            // add the items between the indices
            this.model.listView.items.forEach((item, index) => {
              if (index >= startIndex && index <= lastIndex) {
                utils.pushNoDuplicates(this.selectedItems, item.documentId);
              }
            });
          }

          this.lastSelectedItemId = itemId;
        } else {
          // remove from selected items
          let idxSelectedItem = this.selectedItems.indexOf(itemId);
          if (idxSelectedItem > -1) {
            this.selectedItems.splice(idxSelectedItem, 1);
          }
          this.lastSelectedItemId = null;
        }
      }
    },

    getItemError: function(documentId) {
      return this.model && this.model.listView
        && this.model.listView.projectErrors
        && this.model.listView.projectErrors[documentId];
    },

    openToolbarRequests: ContainersContextToolbarActions.openToolbarRequests,
    openToolbarEventLogs: ContainersContextToolbarActions.openToolbarEventLogs,
    openToolbarClosureResults: ContainersContextToolbarActions.openToolbarClosureResults,
    closeToolbar: ContainersContextToolbarActions.closeToolbar
  },
  events: {
    'do-action': function(actionName) {
      if (actionName === 'deleteAll') {
        // Delete all/ Delete by search criteria
        this.clearSelections();

        ContainerActions.removeContainers(this.queryOptions);
      } else if (actionName === 'multiSelect') {
          // Multi-selection mode
        this.toggleSelectionMode();
      } else if (actionName === 'multiStart') {
        this.deselectCatalogItems();
        this.performBatchOperation('Container.Start');

      } else if (actionName === 'multiStop') {
        this.deselectCatalogItems();
        this.performBatchOperation('Container.Stop');

      } else if (actionName === 'multiRemove') {
        this.performDeleteBatchOperation();
      }
    },

    'go-back': function(fromViewName) {
      let isFromAppDetails = fromViewName === 'application-details';

      if (fromViewName === 'container-details' || isFromAppDetails) {
        let queryOptions = this.queryOptions;
        if (this.model.selectedItemDetails.templateLink) {
          var compositeLink = this.model.selectedItemDetails.instance.compositeComponentLink;
          var compositeId = compositeLink.substring(compositeLink.lastIndexOf('/') + 1);
          NavigationActions.openCompositeContainerDetails(compositeId);
        } else {
          if (isFromAppDetails && !queryOptions) {
            queryOptions = {
              $category: constants.CONTAINERS.SEARCH_CATEGORY.APPLICATIONS
            };
          }

          NavigationActions.openContainers(queryOptions, true);
        }
      }
    }
  },
  components: {
    projectRequestForm: ProjectRequestForm,
    containerRequestForm: ContainerRequestForm,
    networkRequestForm: NetworkRequestForm,
    volumeRequestForm: VolumeRequestForm,
    closureRequestForm: ClosureRequestForm,
    kubernetesRequestForm: KubernetesRequestForm
  }
});

const TAG_NAME = 'containers-view';
Vue.component(TAG_NAME, ContainersViewVueComponent);

function ContainersView($el) {
  return new VueAdapter($el, TAG_NAME);
}

export default ContainersView;
