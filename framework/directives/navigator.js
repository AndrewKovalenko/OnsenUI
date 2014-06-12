/*
Copyright 2013-2014 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';

  var Toolbar = Class.extend({
    leftButtons: [],
    rightButtons: [],
    centerItems: [],
    backLabelItems: [],
    init: function(scope, element, attrs, $compile){
      this.scope = scope;
      this.element = element;
      this.$compile = $compile;
      this.backButtonBox = angular.element(this.element[0].querySelector('.ons-back-button-box'));
      this.leftBox = angular.element(this.element[0].querySelector('.ons-left-box'));
      this.backLabelBox = angular.element(this.element[0].querySelector('.ons-back-label-box'));
      this.backLabelContent = angular.element(this.element[0].querySelector('.ons-back-label-content'));
      this.centerBox = angular.element(this.element[0].querySelector('.ons-center-box'));
      this.rightBox = angular.element(this.element[0].querySelector('.ons-right-box'));
      this.attrs = attrs;

      setTimeout(this.layout.bind(this), 10);      
    },

    layout: function(){
      var containerWidth = this.element[0].clientWidth;
      var backButtonBoxWidth = this.backButtonBox[0].clientWidth;
      var leftBoxWidth = this.leftBox[0].clientWidth;
      var backLabelBoxWidth = this.backLabelBox[0].clientWidth;
      var rightBoxWidth = this.rightBox[0].clientWidth;

      var remainingWidth = containerWidth - (backButtonBoxWidth + leftBoxWidth + backLabelBoxWidth + rightBoxWidth);
      var centerBoxWidth = remainingWidth;

      this.backLabelBox[0].style.left = backButtonBoxWidth + 'px';
      this.leftBox[0].style.left = backButtonBoxWidth + backLabelBoxWidth + 'px';
      this.centerBox[0].style.left = backButtonBoxWidth + leftBoxWidth + backLabelBoxWidth + 'px';
      this.centerBox[0].style.width = remainingWidth + 'px';
      this.rightBox[0].style.right = '0px';
    },

    pushOptions: function(options, pageScope){
      console.log('push options');
      if(options.title){
        this.pushCenterContent(options.title, pageScope);
      }

      this.pushLeftContent(options.left, pageScope);
    },

    popOptions: function(){
      this.popCenterContent();
      this.popBackLabelContent();
    },

    showBackButton: function(){
      
    },

    hideBackButton: function(){

    },

    pushLeftContent: function(leftContent, pageScope){
      setTimeout(function(){
        leftContent = this.$compile(leftContent)(pageScope.$$childHead.$$childHead);
        this.leftBox.append(leftContent);
        this.layout();
      }.bind(this), 10);      
    },

    setLeftContent: function(leftContent){

    },

    pushBackLabelContent: function(content){
      
      var clone = content.clone();
      clone.attr('class', 'ons-back-label-item');
      this.backLabelContent.append(clone);
      var animator = new ons.Animator(clone[0]);
      animator.toCenter();

      if(this.backLabelItems.length > 0){
        var currentItem = this.backLabelItems[this.backLabelItems.length -1];
        currentItem.animator.toLeft();
      }

      this.backLabelItems.push({
        content: clone,
        animator: animator
      });
    },

    popBackLabelContent: function(){
      var currentItem = this.backLabelItems.pop();      
      currentItem.animator.toRight(function(){
        currentItem.content.remove();
      });

      if(this.backLabelItems.length > 0){
        var previousItem = this.backLabelItems[this.backLabelItems.length -1];
        previousItem.animator.toCenter();
      }      
    },

    setBackLabelContent: function(content){

    },

    pushCenterContent: function(content, pageScope){

      setTimeout(function(){
        if(typeof content === 'string'){
          var newContent = angular.element(document.createElement('div'));
          newContent.append(content);

          content = newContent;
        }

        content = content.clone();
        content[0].classList.add('ons-center-item');
        content = this.$compile(content)(pageScope.$$childHead.$$childHead);
        this.centerBox.append(content);        

        var animator = new ons.Animator(content[0]);

        if(this.centerItems.length > 0){
          var previousContentItem = this.centerItems[this.centerItems.length - 1];
          this.pushBackLabelContent(previousContentItem.content);

          previousContentItem.animator.toLeft();
          animator.toCenter();        
        }

        this.centerItems.push({
          animator: animator,
          content: content
        });

        setTimeout(function(){
          pageScope.$digest();
        }, 10);
      }.bind(this), 0);
      
    },

    setCenterContent: function(centerContent){

    },

    pushRightContent: function(rightContent){

    },

    setRightContent: function(rightContent){

    },

    popLeftContent: function(){

    },

    popCenterContent: function(){
      var currentCenterItem = this.centerItems[this.centerItems.length - 1];
      var previousCenterItem = this.centerItems[this.centerItems.length - 2];

      currentCenterItem.animator.toRight(function(){
        currentCenterItem.content.remove();
      });
      previousCenterItem.animator.toCenter();

      this.centerItems.pop();
    },

    popRightContent: function(){

    }
  });

  window.ons = window.ons || {};
  window.ons.Toolbar = Toolbar;
})();


(function() {
  'use strict';
  var directives = angular.module('onsen.directives');

  directives.service('Navigator', function(ONSEN_CONSTANTS, $http, $templateCache, $compile, $parse, NavigatorStack, requestAnimationFrame, PredefinedPageCache, OnsenUtil) {
    var TRANSITION_END = "webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd";

    var Navigator = Class.extend({
      /**
       * @property {Array}
       */
      navigatorItems: undefined,

      /**
       * @property {DOMElement}
       */
      container: undefined,

      /**
       * @property {DOMElement}
       */
      toolbar: undefined,

      /**
       * @property {DOMElement}
       */
      toolbarContent: undefined,

      /**
       * @property {DOMElement}
       */
      leftSection: undefined,

      /**
       * @property {DOMElement}
       */
      leftButtonContainer: undefined,

      /**
       * @property {DOMElement}
       */
      leftArrow: undefined,

      /**
       * @property {DOMElement}
       */
      rightSection: undefined,

      /**
       * @property {DOMElement}
       */
      rightSectionIcon: undefined,

      /**
       * @property {Function}
       */
      leftButtonClickFn: undefined,

      /**
       * @property {DOMElement}
       */
      element: undefined,

      /**
       * @property {Object}
       */
      attrs: undefined,

      /**
       * @property {Object}
       */
      scope: undefined,

      /**
       * @property {Function}
       */
      modifierTemplater: undefined,

      /*
       * @param {Object} scope
       * @param {Object} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs) {
        this.scope = scope;
        this.element = element;
        this.attrs = attrs;

        this.modifierTemplater = OnsenUtil.generateModifierTemplater(attrs);

        this.navigatorItems = [];

        this.container = angular.element(element[0].querySelector('.ons-navigator__content'));
        this.toolbarEl = angular.element(element[0].querySelector('.topcoat-navigation-bar'));
        this.toolbar = new ons.Toolbar(scope, this.toolbarEl, attrs, $compile);
        this.toolbarContent = angular.element(element[0].querySelector('.ons-navigator__toolbar-content'));
        // this.leftSection = angular.element(this.toolbarContent[0].querySelector('.ons-navigator__left-section'));
        // this.leftButtonContainer = angular.element(this.toolbarContent[0].querySelector('.ons-navigator__left-button-container'));
        // this.leftArrow = angular.element(this.leftButtonContainer[0].querySelector('i'));

        // this.rightSection = angular.element(this.toolbarContent[0].querySelector('.ons-navigator__right-button'));
        // this.rightSectionIcon = angular.element(this.rightSection[0].querySelector('.ons-navigator__right-section-icon'));

        // this.leftButtonClickFn = $parse(scope.onLeftButtonClick);

        this.setReady(true);

        // fix android 2.3 click event not fired some times when used with sliding menu
        // this.leftButtonContainer.bind('touchend', function() {});

        // this.leftButtonContainer.bind('click', this.onLeftButtonClicked.bind(this));
        // this.rightSection.bind('click', this.onRightButtonClicked.bind(this));
        if (scope.page) {
          var options = {
            title: scope.title,
            leftButtonIcon: scope.initialLeftButtonIcon,
            rightButtonIcon: scope.rightButtonIcon,
            onLeftButtonClick: scope.onLeftButtonClick,
            onRightButtonClick: scope.onRightButtonClick
          };
          this.pushPage(scope.page, options);
        }
        this.checkiOS7();

        // attrs.$observe('title', function(title) {
        //   if (title) {
        //     this.setTitle(title);
        //   }
        // }.bind(this));

        this.attachScopeMethods();
      },

      attachScopeMethods: function() {
        this.scope.pushPage = this.pushPage.bind(this);
        this.scope.popPage = this.popPage.bind(this);
        this.scope.resetToPage = this.resetToPage.bind(this);
        this.scope.getCurrentNavigatorItem = this.getCurrentNavigatorItem.bind(this);
        this.scope.pages = this.navigatorItems;
      },

      attachFastClickEvent: function(el) {
        if (el && el.nodeType) {
          FastClick.attach(el);
        }
      },

      onTransitionEnded: function() {
        this.setReady(true);
      },

      setReady: function(ready) {
        this.ready = ready;
      },

      isReady: function() {
        return this.ready;
      },

      checkiOS7: function() {
        if (window.device && window.device.platform) {
          if (window.device.platform === 'iOS' && parseFloat(window.device.version) >= 7) {
            setTimeout(this.adjustForiOS7.bind(this), 0);
          }
        } else {
          var self = this;
          document.addEventListener("deviceready", function() {
            if(window.device && window.device.platform){
              self.checkiOS7();
            }
          }, false);
        }
      },

      adjustForiOS7: function() {
        this.toolbar[0].style.height = this.toolbar[0].clientHeight + 20 + 'px';
        this.toolbar[0].style.paddingTop = '20px';
      },

      animateBackLabelIn: function(inNavigatorItem, outNavigatorItem) {
        // var title = outNavigatorItem.options.title;
        // var inBackLabel = angular.element('<div></div>');
        // inBackLabel.addClass(
        //   'ons-navigator__back-label ons-navigator__item ' +
        //   'topcoat-navigation-bar__line-height topcoat-icon-button--quiet ' +
        //   'ons-navigator__back-label--navigate-right ' +
        //   this.modifierTemplater('topcoat-navigation-bar--*__line-height')
        // );
        // inBackLabel.bind('click', this.onLeftButtonClicked.bind(this));
        // this.attachFastClickEvent(inBackLabel[0]);
        // inNavigatorItem.backLabel = inBackLabel;
        // if (inNavigatorItem.options.leftButtonIcon) {
        //   // no back label if user specify icon
        //   inBackLabel[0].style.display = 'none';
        // }
        // this.toolbarContent.prepend(inBackLabel);
        // inBackLabel.text(title);

        // this.toolbarContent[0].offsetWidth;

        // setTimeout(function(){
        //   inBackLabel.removeClass('ons-navigator__back-label--navigate-right');
        //   inBackLabel.addClass('ons-navigator__back-label--transition ons-navigator__back-label--navigate-center');
        // }, 10);


        // var outLabel = outNavigatorItem.backLabel;
        // if (outLabel) {
        //   outLabel.bind(TRANSITION_END, function transitionEnded(e) {
        //     outLabel.remove();
        //     outLabel.unbind(transitionEnded);
        //   });
        //   outLabel.removeClass('ons-navigator__back-label--navigate-center');
        //   outLabel.addClass('ons-navigator__back-label--navigate-left');
        // }
      },

      animateBackLabelOut: function(inNavigatorItem, outNavigatorItem) {
        // var outLabel = outNavigatorItem.backLabel;
        // var inLabel = inNavigatorItem.backLabel;
        // this.toolbarContent.prepend(inLabel);

        // if (outNavigatorItem.options.leftButtonIcon) {
        //   // no back label if user specify icon
        //   outLabel.remove();
        // } else {
        //   outLabel.bind(TRANSITION_END, function transitionEnded(e) {
        //     outLabel.remove();
        //     outLabel.unbind(transitionEnded);
        //   });

        //   this.toolbarContent[0].offsetWidth;
        //   outLabel.removeClass('ons-navigator__back-label--transition ons-navigator__back-label--navigate-center');
        //   outLabel.addClass('ons-navigator__back-label--transition ons-navigator__back-label--navigate-right');
        // }


        // if (inLabel) {
        //   this.toolbarContent[0].offsetWidth;
        //   inLabel.removeClass('ons-navigator__back-label--navigate-left');
        //   inLabel.addClass('ons-navigator__back-label--transition ons-navigator__back-label--navigate-center');
        //   inLabel.bind('click', this.onLeftButtonClicked.bind(this));
        //   this.attachFastClickEvent(inLabel[0]);
        // }
      },

      getCurrentNavigatorItem: function() {
        return this.navigatorItems[this.navigatorItems.length - 1];
      },

      onLeftButtonClicked: function() {
        // var onLeftButtonClick = this.getCurrentNavigatorItem().options.onLeftButtonClick;
        // if (onLeftButtonClick) {
        //   var onLeftButtonClickFn = $parse(onLeftButtonClick);
        //   onLeftButtonClickFn(this.scope.$parent);
        // } else {
        //   if (this.canPopPage()) {
        //     this.popPage();
        //   }
        // }
      },

      onRightButtonClicked: function() {
        // var onRightButtonClick = this.getCurrentNavigatorItem().options.onRightButtonClick;
        // if (onRightButtonClick) {
        //   var onRightButtonClickFn = $parse(onRightButtonClick);
        //   onRightButtonClickFn(this.scope.$parent);
        // }
      },

      setTitle: function(title) { // no animation
        // if (this.isEmpty()) {
        //   return;
        // }
        // var currentNavigatorItem = this.navigatorItems[this.navigatorItems.length - 1];
        // currentNavigatorItem.options.title = title;
        // if (currentNavigatorItem.titleElement) {
        //   currentNavigatorItem.titleElement.text(title);
        // }
      },

      animateTitleIn: function(inNavigatorItem, outNavigatorItem) {
        // var inTitle = inNavigatorItem.options.title || '';
        // var inTitleElement = angular.element('<span>' + inTitle + '</span>');
        // inTitleElement.attr('class', 
        //   'ons-navigator__item ons-navigator__title ' +
        //   'topcoat-navigation-bar__title topcoat-navigation-bar__line-height ' +
        //   'center ons-navigator__title--transition ons-navigator__title--animate-right ' +
        //   this.modifierTemplater('topcoat-navigation-bar--*_title') + ' ' +
        //   this.modifierTemplater('topcoat-navigation-bar--*_line-height')
        // );
        // var outTitleElement = outNavigatorItem.titleElement;
        // outTitleElement.after(inTitleElement);
        // outTitleElement.bind(TRANSITION_END, function transitionEnded(e) {
        //   outTitleElement.remove();
        //   outTitleElement.unbind(transitionEnded);
        // });
        // inNavigatorItem.titleElement = inTitleElement;
        // setTimeout(function(){
        //   inTitleElement.removeClass('ons-navigator__title--animate-right');
        //   inTitleElement.addClass('ons-navigator__title--animate-center');
        //   outTitleElement.removeClass('ons-navigator__title--animate-center');
        //   outTitleElement.addClass('ons-navigator__title--transition ons-navigator__title--animate-left');
        // }, 10);
      },

      animateRightButtonIn: function(inNavigatorItem, outNavigatorItem) {
        // if (inNavigatorItem.rightButtonIconElement || inNavigatorItem.options.rightButtonIcon) {
        //   var rightButtonIconElement;
        //   if (inNavigatorItem.rightButtonIconElement) {
        //     rightButtonIconElement = inNavigatorItem.rightButtonIconElement;
        //   } else {
        //     rightButtonIconElement = angular.element('<i></i>');
        //     rightButtonIconElement.addClass(
        //       inNavigatorItem.options.rightButtonIcon +
        //       ' topcoat-navigation-bar__line-height ons-navigator--fade ' +
        //       this.modifierTemplater('topcoat-navigation-bar--*__line-height')
        //     );
        //     this.rightSectionIcon.append(rightButtonIconElement); // fix bug on ios. strange that we cant use rightSectionIcon.append() here
        //     inNavigatorItem.rightButtonIconElement = rightButtonIconElement;
        //   }

        //   this.rightSection[0].offsetWidth;
        //   setTimeout(function(){
        //     rightButtonIconElement.removeClass('ons-navigator__right-button-container--hidden');
        //     rightButtonIconElement.addClass('ons-navigator__right-button-container--transition ons-navigator__right-button-container--visible');
        //   }, 10);
        // }

        // if (outNavigatorItem && outNavigatorItem.rightButtonIconElement) {
        //   var rightButton = outNavigatorItem.rightButtonIconElement;
        //   rightButton.removeClass('ons-navigator__right-button-container--visible');
        //   rightButton.addClass('ons-navigator__right-button-container--transition ons-navigator__right-button-container--hidden');
        //   rightButton.bind(TRANSITION_END, function transitionEnded(e) {
        //     rightButton.remove();
        //     rightButton.unbind(transitionEnded);
        //   });
        // }

      },

      animateRightButtonOut: function(inNavigatorItem, outNavigatorItem) {
        // if (outNavigatorItem.rightButtonIconElement) {
        //   var outRightButton = outNavigatorItem.rightButtonIconElement;
        //   this.toolbarContent[0].offsetWidth;
        //   outRightButton.removeClass('ons-navigator__right-button--visible');
        //   outRightButton.addClass('ons-navigator__right-button--transition ons-navigator__right-button--hidden');
        //   outRightButton.bind(TRANSITION_END, function transitionEnded(e) {
        //     outRightButton.remove();
        //     outRightButton.unbind(transitionEnded);
        //   });
        // }
        // if (inNavigatorItem.rightButtonIconElement) {
        //   var rightButton = inNavigatorItem.rightButtonIconElement;
        //   this.rightSectionIcon.append(rightButton);
        //   this.rightSection[0].offsetWidth;
        //   rightButton.removeClass('ons-navigator__right-button--hidden');
        //   rightButton.addClass('ons-navigator__right-button--transition ons-navigator__right-button--visible');
        // }
      },

      setLeftButton: function(navigatorItem) {
        // var leftButtonIcon = navigatorItem.options.leftButtonIcon;
        // if (leftButtonIcon) {
        //   this.setBackButtonIcon(leftButtonIcon);
        //   this.showBackButton();
        // } else {
        //   // no icon
        //   if (this.canPopPage()) {
        //     this.showBackButton();
        //     this.setBackButtonIconAsLeftArrow();
        //   } else {
        //     // no icon and is root page
        //     this.hideBackButton();
        //   }
        // }
      },

      setBackButtonIconAsLeftArrow: function() {
        // this.leftArrow.attr('class', 
        //   'fa fa-angle-left fa-2x topcoat-navigation-bar__line-height ' +
        //   this.modifierTemplater('topcoat-navigation-bar--*__line-height')
        // );
      },

      setBackButtonIcon: function(iconClass) {
        // this.leftArrow.attr('class',
        //   iconClass +
        //   ' topcoat-navigation-bar__line-height ' +
        //   this.modifierTemplater('topcoat-navigation-bar--*__line-height')
        // );
      },

      showBackButton: function() {
        // this.toolbarContent[0].offsetWidth;
        // var that = this;
        // setTimeout(function(){
        //   that.leftButtonContainer.removeClass('ons-navigator__left-button-container--hidden');
        //   that.leftButtonContainer.addClass('ons-navigator__left-button-container--transition ons-navigator__left-button-container--visible');
        // }, 200);

      },

      hideBackButton: function() {
        // this.leftButtonContainer.removeClass('ons-navigator__left-button-container--visible');
        // this.leftButtonContainer.addClass('ons-navigator__left-button-container--hidden');
      },

      animateTitleOut: function(currentNavigatorItem, previousNavigatorItem) {

        // var inTitleElement = previousNavigatorItem.titleElement;
        // var outTitleElement = currentNavigatorItem.titleElement;
        // outTitleElement.after(inTitleElement);
        // this.element[0].offsetWidth;
        // outTitleElement.bind(TRANSITION_END, function transitionEnded(e) {
        //   outTitleElement.remove();
        //   outTitleElement.unbind(transitionEnded);
        // });
        // outTitleElement.removeClass('ons-navigator__title--animate-center');
        // outTitleElement.addClass('ons-navigator__title--transition ons-navigator__title--animate-right');
        // inTitleElement.removeClass('ons-navigator__title--animate-left');
        // inTitleElement.addClass('ons-navigator__title--animate-center');
      },

      animatePageIn: function(inPage, outPage) {
        var that = this;
        inPage.bind(TRANSITION_END, function transitionEnded(e) {
          that.onTransitionEnded();
        });

        // wait 10ms fo reflow
        setTimeout(function(){
          inPage.attr("class", "ons-navigator__pager ons-navigator__pager--transition ons-navigator__pager--navigate-center");
          outPage.attr("class", "ons-navigator__pager ons-navigator__pager--transition ons-navigator__pager--navigate-left");
        }, 10);

      },

      animatePageOut: function(currentPage, previousPage) {
        previousPage.attr("class", "ons-navigator__pager ons-navigator__pager--navigate-left");
        this.element[0].offsetWidth;
        previousPage.attr("class", "ons-navigator__pager ons-navigator__pager--transition ons-navigator__pager--navigator-center");

        var that = this;
        currentPage.bind(TRANSITION_END, function transitionEnded(e) {
          var currentPageScope = currentPage.scope();
          if(currentPageScope){
            currentPageScope.$destroy();
          }
          currentPage.remove();
          currentPage.unbind(transitionEnded);
          that.onTransitionEnded();
        });

        currentPage.attr("class", "ons-navigator__pager ons-navigator__pager--transition ons-navigator__pager--navigate-right");
      },

      isEmpty: function() {
        return this.navigatorItems.length < 1;
      },

      canPopPage: function() {
        return this.navigatorItems.length > 1;
      },

      resetToPage: function(page, options) {
        if (!this.isReady()) {
          return;
        }
        var navigatorItem;
        for (var i = 0; i < this.navigatorItems.length; i++) {
          navigatorItem = this.navigatorItems[i];
          if (navigatorItem.backLabel) {
            navigatorItem.backLabel.remove();
          }
          if (navigatorItem.titleElement) {
            navigatorItem.titleElement.remove();
          }
          if (navigatorItem.rightButtonIconElement) {
            navigatorItem.rightButtonIconElement.remove();
          }
        }

        this.container.empty();
        this.navigatorItems = [];
        this.pushPage(page, options);
      },

      generatePageEl: function(pageContent, options){
        var page = angular.element('<div></div>');
        page.addClass('ons-navigator__pager');
        var blackMask = angular.element('<div></div>');
        blackMask.addClass('ons-navigator__black-mask');
        page.append(blackMask);

        var navigatorPage = angular.element('<div></div>');
        navigatorPage.addClass('ons-navigator__page topcoat-page ons-navigator-inner');
        navigatorPage.append(pageContent);

        page.append(navigatorPage);
        return page;
      },

      compilePageEl: function(pageEl, pageScope){
        var compiledPage = $compile(pageEl)(pageScope);
        return compiledPage;
      },

      createPageScope: function(){
        var pageScope = this.scope.$parent.$new();
        return pageScope;
      },

      _pushPageDOM: function(page, pageContent, compiledPage, pageScope, options) {

        var pager = compiledPage;
        this.container.append(pager);

        if (pageContent.querySelector) {
          var navigatorToolbar = pageContent.querySelector('ons-navigator-toolbar');
          if (navigatorToolbar) {
            if (options === undefined) {
              options = {};
            }

            var $navigatorToolbar = angular.element(navigatorToolbar);
            var title = angular.element($navigatorToolbar[0].querySelector('.center'));
            var left = angular.element($navigatorToolbar[0].querySelector('.left'));
            var rightButtonIcon = $navigatorToolbar.attr('right-button-icon');
            var onLeftButtonClick = $navigatorToolbar.attr('on-left-button-click');
            var onRightButtonClick = $navigatorToolbar.attr('on-right-button-click');
            options.title = options.title || title;
            options.left = options.left || left;
            options.rightButtonIcon = options.rightButtonIcon || rightButtonIcon;
            options.onLeftButtonClick = options.onLeftButtonClick || onLeftButtonClick;
            options.onRightButtonClick = options.onRightButtonClick || onRightButtonClick;

            $navigatorToolbar.remove();
          }
        }

        var navigatorItem = {
          page: pager,
          options: options || {},
          pageScope: pageScope
        };

        if (!this.isEmpty()) {
          var previousNavigatorItem = this.navigatorItems[this.navigatorItems.length - 1];
          var previousPage = previousNavigatorItem.page;
          pager.addClass('ons-navigator__pager--navigate-right');

          setTimeout(function() {
            this.animatePageIn(pager, previousPage);            
            // this.animateTitleIn(navigatorItem, previousNavigatorItem);

            // this.animateBackLabelIn(navigatorItem, previousNavigatorItem);
            // this.animateRightButtonIn(navigatorItem, previousNavigatorItem);
          }.bind(this), 0);

        } else {
          // root page
          // var titleElement = angular.element('<div></div>');

          // titleElement.addClass(
          //   'ons-navigator__item ons-navigator__title ' +
          //   'topcoat-navigation-bar__title topcoat-navigation-bar__line-height ' +
          //   'center ons-navigator__title--animate-center ' + 
          //   this.modifierTemplater('topcoat-navigation-bar--*__title') + ' ' +
          //   this.modifierTemplater('topcoat-navigation-bar--*__line-height')
          // );

          // if (options.title) {
          //   titleElement.text(options.title);
          // }
          // this.toolbarContent.append(titleElement);
          // navigatorItem.titleElement = titleElement;
          // this.animateRightButtonIn(navigatorItem, null);
          this.setReady(true);
        }
        this.toolbar.pushOptions(navigatorItem.options, pageScope);
        this.navigatorItems.push(navigatorItem);
        // this.setLeftButton(navigatorItem);
      },

      appendPage: function(templateHTML, options) {
        var div = document.createElement('div');
        div.className = 'full-width full-height';
        div.innerHTML = templateHTML;
        var pageContent = angular.element(div.cloneNode(true));
        var pageEl = this.generatePageEl(pageContent, options);
        var pageScope = this.createPageScope();
        var compiledPage = this.compilePageEl(pageEl, pageScope);
        this._pushPageDOM(options.page, div, compiledPage, pageScope, options);
      },

      pushPage: function(page, options) {
        if (options && typeof options != "object") {
          throw new Error('options must be an objected. You supplied ' + options);
        }
        options = options || {};
        options.page = page;

        if (!this.isReady()) {
          return;
        }

        var that = this,
          templateHTML = $templateCache.get(page);

        this.setReady(false);

        if (templateHTML) {
          this.appendPage(templateHTML, options);
        } else {
          $http({
              url: page,
              method: 'GET',
              cache: PredefinedPageCache
            }).error(function(e) {
              that.onTransitionEnded();
              console.error(e);
            }).success(function(templateHTML, status, headers, config) {
              this.appendPage(templateHTML, options);
            }.bind(this)).error(function(data, status, headers, config) {
            console.error('error', data, status);
          });
        }
      },

      popPage: function() {
        if (this.navigatorItems.length < 2 || !this.isReady()) {
          return;
        }
        this.setReady(false);

        var currentNavigatorItem = this.navigatorItems.pop();
        var previousNavigatorItem = this.navigatorItems[this.navigatorItems.length - 1];

        var currentPage = currentNavigatorItem.page;
        var previousPage = previousNavigatorItem.page;
        this.animatePageOut(currentPage, previousPage);
        this.toolbar.popOptions();

        // this.animateTitleOut(currentNavigatorItem, previousNavigatorItem);
        // this.animateBackLabelOut(previousNavigatorItem, currentNavigatorItem);

        // this.setLeftButton(previousNavigatorItem);
        // this.animateRightButtonOut(previousNavigatorItem, currentNavigatorItem);
        currentNavigatorItem.pageScope.$destroy();
      }
    });

    return Navigator;
  });

  directives.directive('onsNavigator', function(ONSEN_CONSTANTS, $http, $compile, $parse, NavigatorStack, Navigator, OnsenUtil, $templateCache) {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: {
        title: '@',
        page: '@',
        hideToolbar: '@',
        initialLeftButtonIcon: '@leftButtonIcon',
        rightButtonIcon: '@',
        onLeftButtonClick: '@',
        onRightButtonClick: '@'
      },

      compile: function(element, attrs, transclude) {
        var path = ONSEN_CONSTANTS.DIRECTIVE_TEMPLATE_URL + '/navigator.tpl';
        element.append(angular.element($templateCache.get(path))[0]);
        var modifierTemplater = OnsenUtil.generateModifierTemplater(attrs);

        return {
          pre: function preLink(scope, iElement, iAttrs, controller){
            // Without templateUrl, we must manually link the scope
            scope.modifierTemplater = modifierTemplater;
            $compile(iElement.children())(scope);
          },

          post: function postLink(scope, iElement, attrs, controller){
            var navigator = new Navigator(scope, iElement, attrs);
            OnsenUtil.declareVarAttribute(attrs, navigator);

            if (!attrs.page) {
              var pageScope = navigator.createPageScope();

              transclude(pageScope, function(compiledPageContent) {
                var options = {
                  title: scope.title,
                  leftButtonIcon: scope.initialLeftButtonIcon,
                  rightButtonIcon: scope.rightButtonIcon,
                  onLeftButtonClick: scope.onLeftButtonClick,
                  onRightButtonClick: scope.onRightButtonClick
                };
                var compiledPage = navigator.generatePageEl(angular.element(compiledPageContent), options);
                navigator._pushPageDOM('', compiledPageContent[0], compiledPage, pageScope, options);
              });
            }

            NavigatorStack.addNavigator(scope);
            scope.$on('$destroy', function(){
              NavigatorStack.removeNavigator(scope);
            });
          }
        };
      }
    };
  });
})();
