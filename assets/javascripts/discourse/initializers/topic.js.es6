import { withPluginApi } from "discourse/lib/plugin-api";
import discourseComputed from "discourse-common/utils/decorators";
import topicNavigation from "discourse/components/topic-navigation";
import topicCategory from "discourse/components/topic-category";
import Controller, { inject as controller } from "@ember/controller";
import EmberObject, { action } from "@ember/object";

function initializeHideAnswersPlugin(api) {
  let currentUser = Discourse.User ? Discourse.User.current() : false;
  let siteCategories = Discourse.__container__.lookup("controller:application")
    .site.categories;
  let allowedCategories = siteCategories
    ? siteCategories.filter(cat => cat.make_public_enabled).map(cat => cat.id)
    : [];

  api.modifyClass("model:topic", {
    init() {
      this._super(...arguments);
      this.allowedCategories = allowedCategories;
      // console.log("allowedCategories", this.allowedCategories)
    }
  });

  api.modifyClass("component:topic-category", {
    pluginId: "t-category",
    init() {
      this._super(...arguments);
      this.allowedCategories = allowedCategories;
    }
  });

  api.modifyClass("controller:topic", {
    pluginId: "t-plugin",
    init() {
      this._super(...arguments);
      if (this.currentUser) {
        this.currentUser.canViewAnswers = userCanViewAnswers(this.currentUser);
      }
    },
    @discourseComputed(
      "model.postStream.posts",
      "model.postStream.postsWithPlaceholders"
    )
    postsToRender(posts, postsWithPlaceholders) {
      return (this.currentUser && this.currentUser.canViewAnswers) ||
        allowedCategories.includes(this.model.category_id)
        ? this.capabilities.isAndroid
          ? posts
          : postsWithPlaceholders
        : this.capabilities.isAndroid
        ? posts.slice(0, 1)
        : postsWithPlaceholders.slice(0, 1);
    }
  });

  api.modifyClass("component:topic-navigation", {
    pluginId: "t-navigation",
    init() {
      this._super(...arguments);
      let currentCategory = this.parentView
        ? this.parentView.topic.category_id
        : false;
      // console.log("component:topic-navigation!",currentCategory);
      if (
        !userCanViewAnswers(currentUser) &&
        !allowedCategories.includes(currentCategory)
      ) {
        this.set("canRender", false);
      }
    }
  });
}

function userCanViewAnswers(user = false) {
  if (!user) {
    return;
  }
  let user_groups = user.groups.map(g => g.name);
  let allowedGroups = Discourse.application.SiteSettings.allowed_groups;
  // console.log("allowedGroups", allowedGroups);
  // console.log("user_groups:", user_groups);
  return (
    user_groups.some(g => allowedGroups.split("|").includes(g)) ||
    user.admin ||
    user.moderator
  );
}

export default {
  name: "restric-answer",
  initialize() {
    withPluginApi("0.1", initializeHideAnswersPlugin);
  }
};
