export const host = "http://localhost:5000";
export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`; // <-- New
export const recieveMessageRoute = `${host}/api/messages/getmsg`; // <-- New
export const deleteMessageRoute = `${host}/api/messages/deleteparams`;