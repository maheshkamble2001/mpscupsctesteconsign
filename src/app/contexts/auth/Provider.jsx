// Import Dependencies
import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import { toast } from "sonner";

// Local Imports
import { normalDecryptData, normalEncryptData } from "configs/encryption";
import { isTokenValid, setSession } from "utils/jwt";
import { AuthContext } from "./context";
import { getGoogleLogin, getLogIn } from "api/login/login";

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  role: [],
  roleid: null,
  rolename: null,
};

// ----------------------------------------------------------------------

const reducerHandlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, role, roleid, rolename } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      role,
      roleid,
      rolename,
    };
  },

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
  }),

  LOGIN_SUCCESS: (state, action) => {
    const { user, role, roleid, rolename } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      user,
      role,
      roleid,
      rolename,
    };
  },

  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload.errorMessage,
    isLoading: false,
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    role: [],
    roleid: null,
    rolename: null,
  }),
};

// ----------------------------------------------------------------------

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ✅ INIT
  useEffect(() => {
    const init = async () => {
      try {
        const token = Cookies.get("access_token");

        if (token && isTokenValid(token)) {
          setSession(token);

          const name = Cookies.get("name");
          const email = Cookies.get("email");
          const id = Cookies.get("userid");

          const role = Cookies.get("role")
            ? JSON.parse(normalDecryptData(Cookies.get("role")))
            : [];

          const roleid = Cookies.get("roleid")
            ? parseInt(Cookies.get("roleid"))
            : null;

          const rolename = Cookies.get("rolename") || null;

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: { name, email, id },
              role,
              roleid,
              rolename,
            },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
              role: [],
              roleid: null,
              rolename: null,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
            role: [],
            roleid: null,
            rolename: null,
          },
        });
      }
    };

    init();
  }, []);

  // ✅ NORMAL LOGIN
  const login = async (credentials) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const data = await getLogIn(credentials);

      if (data.code === 200) {
        const {
          access_token,
          name,
          email,
          firstname,
          lastname,
          userid,
          roleAccess,
          roleId,
          rolename,
        } = data.data;

        Cookies.set("access_token", access_token, { expires: 15 });
        Cookies.set("name", name||`${firstname} ${lastname}`, { expires: 15 });
        Cookies.set("email", email, { expires: 15 });
        Cookies.set("userid", userid, { expires: 15 });
        Cookies.set(
          "role",
          normalEncryptData(JSON.stringify(roleAccess || [100000], { expires: 15 }))
        );
        Cookies.set("roleid", roleId?.toString() || "", { expires: 15 });
        Cookies.set("rolename", rolename || "", { expires: 15 });

        setSession(access_token);
        // Cookies.set(
        //   "role",
        //   "U2FsdGVkX1+e/AcooOc9bxF8YWZtO3l3UAvseRtvlUa+KXqXs/HLkBLvKvT+L8Os5Aakzu6+atbTekgf155QPMnkFMJiVeeotBCqrNdXlcv4JB9/51g8jEdsAUmqijwwptpHA+5i2/ytckJvD1zZhscPNAdS8S3QLeKKLnij88Aho0VPscXquLqb5kUqYAU7bQy/CRVUZB+MZGsF4gYYCPUj7azlim4BSoe8tcf96qs="
        // );
        //   Cookies.set("access_token", "dummy_token_for_testing", { expires: 15 });
        //   Cookies.set("name", "John Doe");
        //   Cookies.set("email", "johndoe@example.com");
        //   Cookies.set("userid", "1");
        //   Cookies.set("roleid", "1");
        //   Cookies.set("rolename", "Admin");
        //   setSession("dummy_token_for_testing");

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: { name, email, id: userid },
            role: roleAccess || [100000],
            roleid: roleId,
            rolename: rolename,
          },
          // payload: {
          //   user: { name: "John Doe", email: "johndoe@example.com", id: userid },
          //   role:  [100000],
          //   roleid: 1,
          //   rolename: "Admin",
          // },
        });

        return data; // ✅ Pura data return karo (code: 200 ke saath)
      }

      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: data.message },
      });

      return data; // ✅ Return error response (code: 100 etc.)
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: "Login failed" },
      });
      return { code: 500, message: "Server connection failed" };
    }
  };
  // ✅ 🔥 GOOGLE LOGIN (FIX ADDED)
  const googleLogin = async (payload) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const data = await getGoogleLogin(payload);

      if (data.code === 200) {
        const {
          access_token,
          name,
          email,
          userid,
          roleAccess,
          roleId,
          rolename,
        } = data.data;

        Cookies.set("access_token", access_token, { expires: 15 });
        Cookies.set("name", name, { expires: 15 });
        Cookies.set("email", email, { expires: 15 });
        Cookies.set("userid", userid, { expires: 15 });
        Cookies.set(
          "role",
          normalEncryptData(JSON.stringify(roleAccess || [100000]), { expires: 15 })
        );
        Cookies.set("roleid", roleId?.toString() || "", { expires: 15 });
        Cookies.set("rolename", rolename || "", { expires: 15 });

        setSession(access_token);

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: { name, email, id: userid },
            role: roleAccess || [100000],
            roleid: roleId,
            rolename: rolename,
          },
        });

        return data; // ✅ Success response return karo
      }

      // Agar code 200 nahi hai (jaise 100), toh error return karo
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: data.message },
      });

      return data; // ✅ Error response return karo (rolename is not defined wala)

    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: "Google Login Failed" },
      });
      return { code: 500, message: "Network Error" };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("name");
    Cookies.remove("email");
    Cookies.remove("userid");
    Cookies.remove("role");
    Cookies.remove("roleid");
    Cookies.remove("rolename");

    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  if (!state.isInitialized) return null;

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
        googleLogin, // ✅ FIX
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};