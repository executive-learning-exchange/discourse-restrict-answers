import { withPluginApi } from 'discourse/lib/plugin-api';
import discourseComputed from "discourse-common/utils/decorators";
import topicNavigation from 'discourse/components/topic-navigation';

function initializeTestPlugin(api){

  let currentUser = Discourse.User ?  Discourse.User.current() : false;

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
      return this.currentUser &&  this.currentUser.canViewAnswers
      ? (this.capabilities.isAndroid ? 
        posts : postsWithPlaceholders) 
      : (this.capabilities.isAndroid ? posts.slice(0, 1) : postsWithPlaceholders.slice(0, 1));
    }
  });


  api.modifyClass("component:topic-navigation", {
    pluginId: 'test-navigations',
    init(){
      this._super(...arguments);
      if(!userCanViewAnswers(currentUser)){
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
    let canView = user_groups.includes('privileged') || user.admin || user.moderator;
    return canView;
}

export default {
  name: 'test-plugin',
  initialize() {
     withPluginApi('0.1', initializeTestPlugin);
  }
}

