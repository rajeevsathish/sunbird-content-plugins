describe("lesson browser plugin", function() {
    var manifest, path, ctrl, $scope, pluginInstance;
    beforeAll(function(done) {
        manifest = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.lessonbrowser");
        path = ecEditor.resolvePluginResource(manifest.id, manifest.ver, "editor/lessonBrowserApp.js");
        pluginInstance = org.ekstep.pluginframework.pluginManager.pluginObjs["org.ekstep.lessonbrowser"];
        done();
    });

    it('mock controller', function(done) {
        angular.mock.module('oc.lazyLoad');
        angular.mock.module('Scope.safeApply');
        inject(function($ocLazyLoad, _$rootScope_, _$controller_) {
            var $controller = _$controller_;
            $scope = _$rootScope_.$new();

            $ocLazyLoad.load([
                { type: 'js', path: path }
            ]).then(function() {
                ctrl = $controller("lessonController", { $scope: $scope, instance: { manifest: manifest } });
                done();
            }, function(error) {
                done();
            });
            setInterval(function() {
                _$rootScope_.$digest();
            }, 10);
        });
    });
    
    describe("Lesson browser", function() {
        describe("Init lesson browser", function() {
            it("It should initialized Lesson browser plugin", function() {
                spyOn(pluginInstance, 'initialize').and.callThrough();
                pluginInstance.initialize(manifest);
                expect(pluginInstance.initialize).toHaveBeenCalled();
            });
            it("Should initialize the lesson browser with filters", function(done) {
                spyOn(pluginInstance, "initPreview").and.callThrough();
                var query = {
                    "query": {
                        "lessonType": [
                        "Resource"
                        ]
                    }
                };
                ecEditor.dispatchEvent('org.ekstep.lessonbrowser:show', query);
                expect(pluginInstance.query).toEqual(query.query);
                done();
            });
            it("By dispatching editor:invoke:viewall event init preview should called", function(done) {
                spyOn(pluginInstance, "initPreview").and.callThrough();
                ecEditor.dispatchEvent('editor:invoke:viewall', {
                    "client": "org",
                    "request": {
                        "mode": "soft",
                        "filters": {
                        "objectType": [
                            "Content"
                        ],
                        "status": [
                            "Live"
                        ],
                        "contentType": [
                            "Collection",
                            "Resource"
                        ]
                        },
                        "offset": 0,
                        "limit": 100,
                        "softConstraints": {
                        "gradeLevel": 100,
                        "medium": 50,
                        "board": 25
                        }
                    },"callback": function(){}
                });
                expect(pluginInstance.client).toEqual("org");
                done();
            });
        });
        describe("View all", function() {
            it("ContentType filter should prefilled with Resource type", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "objectType": [
                            "Resource"
                        ]}}});
                expect(ctrl.filterSelection.contentType).toEqual("Resource");
            });
            it("ContentType filter should prefilled with Collection type", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "objectType": [
                            "Collection"
                        ]}}});
                expect(ctrl.filterSelection.contentType).toEqual(["Collection"]);
            });
            it("CURRICULUM filter should prefilled with ICSE", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "board": [
                            "ICSE"
                        ]}}});
                expect(ctrl.filterSelection.board).toEqual(["ICSE"]);
            });
            it("CLASS filter should prefilled with Class 1", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "gradeLevel": [
                            "Class 1"
                        ]}}});
                expect(ctrl.filterSelection.gradeLevel).toEqual(["Class 1"]);
            });
            it("SUBJECT  filter should prefilled with English", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "subject": [
                            "English"
                        ]}}});
                expect(ctrl.filterSelection.subject).toEqual(["English"]);
            });
            it("MEDIUM  filter should prefilled with English", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "medium": [
                            "English"
                        ]}}});
                expect(ctrl.filterSelection.medium).toEqual(["English"]);
            });
        });
        describe("Apply rootNode Metadata", function() {
            it("If root node having NCERT board, filters should be prefilled as NCERT board", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "objectType": [
                            "Resource"
                        ]}}});
                $scope.contentMeta.board = ["NCERT"]; 
                expect($scope.rootNodeFilter.board).toEqual($scope.contentMeta.board);
            });
            it("If root node having NCERT board and Query having NCF, filters should be prefilled as NCERT, NCF board", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "board":["NCF"], 
                        "objectType": [
                            "Resource"
                        ]}}});
                $scope.contentMeta.board = ["NCERT"]; 
                expect($scope.rootNodeFilter.board).toEqual($scope.contentMeta.board);
            });
            it("If root node having English medium, filters should be prefilled as English medium", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "objectType": [
                            "Resource"
                        ]}}});
                $scope.contentMeta.medium = ["English"]; 
                expect($scope.rootNodeFilter.medium).toEqual($scope.contentMeta.medium);
            });
            it("If root node having English subject, filters should be prefilled as English subject", function() {
                spyOn(ctrl, 'viewAll').and.callThrough();
                ctrl.viewAll({"request": {
                        "filters": {
                        "objectType": [
                            "Resource"
                        ]}}});
                $scope.contentMeta.subject = ["English"]; 
                expect($scope.rootNodeFilter.subject).toEqual($scope.contentMeta.subject);
            });
            it("If no result after applying rootnode filters, `Resources not found` message should be shown", function() {
                var returnData = {
                    "id": "api.page.assemble",
                    "ver": "v1",
                    "ts": "2018-09-03 11:34:27:737+0000",
                    "params": {
                        "resmsgid": null,
                        "msgid": "b54a2f98-d9bb-4569-bd11-be59bfd8e8e5",
                        "err": null,
                        "status": "success",
                        "errmsg": null
                    },
                    "responseCode": "OK",
                    "result": {
                        "response": {
                            "name": "ContentBrowser",
                            "id": "01245041694089216064",
                            "sections": [{
                                "display": "{\"name\":{\"en\":\"Latest Resource\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d45970-af6d-11e8-9634-53eaaf4a9295",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"contentType\":[\"Resource\"]},\"limit\":\"10\",\"sort_by\":{\"lastUpdatedOn\":\"desc\"}}}",
                                "name": "Latest Resource",
                                "id": "0124503875868344328",
                                "apiId": "api.content.search",
                                "group": 1
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Resource\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d51cc0-af6d-11e8-ae30-032e1c361ffa",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"filters\":{\"contentType\":[\"Resource\"]},\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded Resource",
                                "id": "0124503875957800968",
                                "apiId": "api.content.search",
                                "group": 2
                            }, {
                                "display": "{\"name\":{\"en\":\"Latest Collection\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d320f0-af6d-11e8-9634-53eaaf4a9295",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"mimeType\":\"application/vnd.ekstep.content-collection\",\"contentType\":\"Collection\"},\"limit\":10,\"exists\":[\"lastUpdatedOn\"],\"sort_by\":{\"lastUpdatedOn\":\"desc\"}}}",
                                "name": "Latest Collection",
                                "id": "0124503922130452480",
                                "apiId": "api.content.search",
                                "group": 3
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Collection\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d60720-af6d-11e8-ae30-032e1c361ffa",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"mimeType\":\"application/vnd.ekstep.content-collection\",\"contentType\":\"Collection\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded Collection",
                                "id": "0124503910202245122",
                                "apiId": "api.content.search",
                                "group": 4
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Interactive Lesson\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d4a790-af6d-11e8-9634-53eaaf4a9295",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"mimeType\":\"application/vnd.ekstep.ecml-archive\",\"contentType\":\"Collection\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\",\"me_totalInteractions\":\"desc\"}}}",
                                "name": "Most Downloaded Interactive Lesson",
                                "id": "01245039556523622420",
                                "apiId": "api.content.search",
                                "group": 5
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Interactive Worksheet\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d591f0-af6d-11e8-ae30-032e1c361ffa",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"filters\":{\"mimeType\":\"application/vnd.ekstep.ecml-archive\",\"contentType\":[\"Resource\"],\"resourceType\":[\"Worksheet\"]},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\",\"me_totalInteractions\":\"desc\"}}}",
                                "name": "Most Downloaded Interactive Worksheet",
                                "id": "01245039576209817636",
                                "apiId": "api.content.search",
                                "group": 6
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Youtube\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d43260-af6d-11e8-9634-53eaaf4a9295",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"objectType\":\"Content\",\"mimeType\":\"video/x-youtube\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded Youtube",
                                "id": "01245040305298636825",
                                "apiId": "api.content.search",
                                "group": 7
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Pdf\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d543d0-af6d-11e8-ae30-032e1c361ffa",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"objectType\":\"Content\",\"mimeType\":\"application/pdf\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded Pdf",
                                "id": "01245040346686259245",
                                "apiId": "api.content.search",
                                "group": 8
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded Epub\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d56ae0-af6d-11e8-9634-53eaaf4a9295",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"objectType\":\"Content\",\"mimeType\":\"application/epub\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded Epub",
                                "id": "01245040815771648046",
                                "apiId": "api.content.search",
                                "group": 9
                            }, {
                                "display": "{\"name\":{\"en\":\"Most Downloaded H5P\"}}",
                                "alt": null,
                                "count": 0,
                                "description": null,
                                "index": 1,
                                "sectionDataType": "ContentBrowser",
                                "imgUrl": null,
                                "resmsgId": "50d4f5b0-af6d-11e8-ae30-032e1c361ffa",
                                "contents": null,
                                "searchQuery": "{\"request\":{\"query\":\"\",\"filters\":{\"objectType\":\"Content\",\"mimeType\":\"application/vnd.ekstep.h5p-archive\"},\"limit\":10,\"sort_by\":{\"me_totalDownloads\":\"desc\"}}}",
                                "name": "Most Downloaded H5P",
                                "id": "01245041107574784029",
                                "apiId": "api.content.search",
                                "group": 10
                            }]
                        }
                    }
                };
                spyOn($scope, 'getPageAssemble').and.returnValue(returnData);
                $scope.invokeFacetsPage();
                var contentCount = _.findIndex(returnData.result.response.sections, function(section) { return section.count > 0 });
                //$scope.contentMeta.subject = ["English"]; 
                expect(contentCount).toEqual(-1);
            });
        });
    });
});