/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MeetingCtrl
 * @description
 * # MeetingCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('meetingCtrl', ['$log', 'AhjoMeetingSrv', '$stateParams', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', function($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData) {
        $log.debug("meetingCtrl: CONTROLLER");
        var self = this;
        var isMobile = $rootScope.isMobile;
        self.upperUrl = {};
        self.lowerUrl = {};
        self.error = null;
        self.topic = StorageSrv.get(CONST.KEY.TOPIC);
        self.blockMode = CONST.BLOCKMODE.UPPER;
        self.lbms = CONST.LOWERBLOCKMODE;
        self.lbm = CONST.LOWERBLOCKMODE.PROPOSALS;
        self.header = '';
        $rootScope.menu = $stateParams.menu;

        self.tData = null;
        self.aData = null;
        self.dData = null;
        self.amData = null;

        function setData(topic) {
            if (topic instanceof Object) {
                self.header = topic.topicTitle;
                if (topic.esitykset instanceof Array) {
                    var item = topic.esitykset[0];
                    if (item instanceof Object) {
                        self.tData = AttachmentData.create((item.documentTitle ? item.documentTitle : 'STR_TOPIC'), item.link);
                    }
                    else {
                        self.tData = null;
                    }
                }
                else {
                    self.tData = null;
                }

                self.lowerUrl = {};
                self.upperUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList('STR_ATTACHMENTS', topic.attachment);
                self.dData = ListData.createDecisionList('STR_DECISION_HISTORY', topic.decision);
                self.amData = ListData.createAdditionalMaterialList('STR_ADDITIONAL_MATERIAL', topic.additionalMaterial);
            }
            else {
                self.lowerUrl = {};
                self.upperUrl = {};
            }
        }

        function checkMode() {
            if (!isMobile && self.isUpperMode()) {
                self.blockMode = CONST.BLOCKMODE.BOTH;
            }
        }

        self.upperClicked = function() {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.LOWER) ? CONST.BLOCKMODE.UPPER : CONST.BLOCKMODE.BOTH;
        };

        self.lowerClicked = function() {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.UPPER) ? CONST.BLOCKMODE.LOWER : CONST.BLOCKMODE.BOTH;
        };

        self.topicClicked = function() {
            if (isMobile) {
                StorageSrv.set(CONST.KEY.LISTPDF_DATA, self.tData);
                $state.go(CONST.APPSTATE.TOPIC);
            }
        };

        self.attachmentClicked = function(attachment) {
            self.lbm = CONST.LOWERBLOCKMODE.ATTACHMENTS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.aData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (attachment instanceof Object) {
                self.lowerUrl = attachment.link ? attachment.link : {};
            }
            checkMode();
        };

        self.decisionClicked = function(decision) {
            self.lbm = CONST.LOWERBLOCKMODE.MATERIALS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.dData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (decision instanceof Object) {
                self.lowerUrl = decision.link ? decision.link : {};
            }
            checkMode();
        };

        self.additionalMaterialClicked = function(material) {
            self.lbm = CONST.LOWERBLOCKMODE.MATERIALS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.amData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (material instanceof Object) {
                self.lowerUrl = material.link ? material.link : {};
            }
            checkMode();
        };

        self.proposalsClicked = function() {
            self.lbm = CONST.LOWERBLOCKMODE.PROPOSALS;
            if (isMobile) {
                $state.go(CONST.APPSTATE.LISTPROPOSALS);
            }
            checkMode();
        };

        self.isBothMode = function() {
            return self.blockMode === CONST.BLOCKMODE.BOTH;
        };

        self.isUpperMode = function() {
            return self.blockMode === CONST.BLOCKMODE.UPPER;
        };

        self.isLowerMode = function() {
            return self.blockMode === CONST.BLOCKMODE.LOWER;
        };

        self.isSecret = function(item) {
            return (item && item.publicity) ? (item.publicity === CONST.PUBLICITY.SECRET) : false;
        };

        self.showEmbeddedFile = function(url) {
            return self.isUrlString(url) && !self.isActive(CONST.LOWERBLOCKMODE.PROPOSALS);
        };

        self.isActive = function(mode) {
            return self.lbm === mode;
        };

        self.isUrlString = function(url) {
            return (url && (typeof url === "string") && url.length) ? true : false;
        };

        $scope.$watch(function() {
            return StorageSrv.get(CONST.KEY.TOPIC);
        }, function(newTopic, oldTopic) {
            if (newTopic !== oldTopic) {
                self.topic = newTopic;
                setData(self.topic);
            }
        });

        $scope.$on('$destroy', function() {
            $log.debug("meetingCtrl: DESTROY");
        });

        setData(self.topic);
    }]);
