import axios from "axios";

export const loginCall = async (userCredential, dispatch) => {
  // dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("https://social-fuel-server.vercel.app/api/auth/login", userCredential);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });     
  } catch (err) {
    console.log("res",err)
    dispatch({ type: "LOGIN_FAILURE", payload: err });
  }
};
