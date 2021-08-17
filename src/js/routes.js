
import HomePage from '../pages/home.vue';
import AboutPage from '../pages/about.vue';
import FormPage from '../pages/form.vue';
import CatalogPage from '../pages/catalog.vue';
import ProductPage from '../pages/product.vue';
import SettingsPage from '../pages/settings.vue';

import DynamicRoutePage from '../pages/dynamic-route.vue';
import RequestAndLoad from '../pages/request-and-load.vue';
import NotFoundPage from '../pages/404.vue';

import SignInPage from '../pages/auth/signin.vue';
import SignUpPage from '../pages/auth/signup.vue';
import EditProfilePage from '../pages/auth/editprofile.vue';

import RequestsPage from '../pages/chat/requests.vue';
import ContactsPage from '../pages/chat/contacts.vue';
import ChatPage from '../pages/chat/chat.vue';
import ChatGroupsPage from '../pages/chatgroups/chatgroups.vue'
import ChatGroupPage from '../pages/chatgroups/chatgroup.vue';
import NewGroupPage from '../pages/chatgroups/newgroup.vue';
import AddMembersPage from '../pages/chatgroups/addmembers.vue';
import GroupMembersPage from '../pages/chatgroups/groupmembers.vue';
import GroupInfoPage from '../pages/chatgroups/groupinfo.vue';


var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/signin/',
    component: SignInPage,
  },
  {
    path: '/signup/',
    component: SignUpPage,
  },
  {
    path: '/editprofile/',
    component: EditProfilePage,
  },
  {
    path: '/requests/',
    component: RequestsPage,
  },
  {
    path: '/contacts/',
    component: ContactsPage,
  },
  {
    path: '/chat/:friend',
    component: ChatPage,
  },
  {
    path: '/chatgroups/',
    component: ChatGroupsPage,
  },
  {
    path: '/chatgroup/:group',
    component: ChatGroupPage,
  },
  {
    path: '/addmembers/:group_name',
    component: AddMembersPage,
  },
  {
    path: '/groupmembers/:group_name',
    component: GroupMembersPage,
  },
  {
    path: '/groupinfo/:group_name',
    component: GroupInfoPage,
  },
  {
    path: '/newgroup/',
    component: NewGroupPage,
  },
  {
    path: '/form/',
    component: FormPage,
  },
  {
    path: '/catalog/',
    component: CatalogPage,
  },
  {
    path: '/product/:id/',
    component: ProductPage,
  },
  {
    path: '/settings/',
    component: SettingsPage,
  },

  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
