import { withPluginApi } from 'discourse/lib/plugin-api';
import discourseComputed from "discourse-common/utils/decorators";
import topicNavigation from 'discourse/components/topic-navigation';
import topicCategory from 'discourse/components/topic-category';
import Controller, { inject as controller } from "@ember/controller";
import EmberObject, { action } from "@ember/object";

function initializeTestPlugin(api){
 
  let currentUser = Discourse.User ?  Discourse.User.current() : false;
  let siteCategories = Discourse.__container__.lookup("controller:application").site.categories;
  let allowedCategories = siteCategories 
    ? Array.from(siteCategories).filter(c=>c.permission>=1).map(cat=>cat.id) 
    : [];


  api.modifyClass("model:topic",{
     init(){
      this._super(...arguments);
      this.allowedCategories = allowedCategories;
    },
  });

  api.modifyClass("component:topic-category", {
    pluginId: 'test-category',
    init(){
      this._super(...arguments);
      if(this.topic){
        window.currentCategory = this.topic.category_id;
      }
      this.allowedCategories = allowedCategories;
    },
    // @discourseComputed("allowedCategories")
    // isPublicCategory(allowedCategories) {
    //   console.log('being computed');
    //   return allowedCategories.includes(this.topic.category_id);
    // }
  });

  api.modifyClass("controller:topic", {
    pluginId: 'test-plugin',
    init(){
      this._super(...arguments);
      if (this.currentUser){
         this.currentUser.canViewAnswers = userCanViewAnswers(this.currentUser);
      }
    },
    @discourseComputed(
        "model.postStream.posts",
        "model.postStream.postsWithPlaceholders"
      )
    postsToRender(posts,postsWithPlaceholders){
      return (this.currentUser &&  this.currentUser.canViewAnswers) || allowedCategories.includes(window.currentCategory)
      ? (this.capabilities.isAndroid ? 
        posts : postsWithPlaceholders) 
      : (this.capabilities.isAndroid ? posts.slice(0, 1) : postsWithPlaceholders.slice(0, 1));
    },
  });


  api.modifyClass("component:topic-navigation", {
    pluginId: 'test-navigations',
    init(){
      this._super(...arguments);
      if(!userCanViewAnswers(currentUser) && !allowedCategories.includes(window.currentCategory)){
        this.set("canRender", false);
      }
    }
  });
}


function userCanViewAnswers(user=false){
    if(!user){
      return;
    }
    let user_groups = user.groups.map(g => g.name);
    return user_groups.includes('privileged') || user.admin || user.moderator ;
}

export default {
  name: 'test-plugin',
  initialize() {
     withPluginApi('0.1', initializeTestPlugin);
  }
}

