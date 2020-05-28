import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { RouteWithLayout } from 'components';
import { Main as MainLayout, Minimal as MinimalLayout } from 'layouts';

import {
    Dashboard as DashboardView,
    ProductList as ProductListView,
    UserList as UserListView,
    Typography as TypographyView,
    Icons as IconsView,
    Account as AccountView,
    Settings as SettingsView,
    SignUp as SignUpView,
    SignIn as SignInView,
    NotFound as NotFoundView
  } from 'views';

import { CircularProgress } from '@material-ui/core'

import { useCookies } from 'react-cookie'
import axios from 'axios'

import AuthContext from './context' 

import { useLocation, useHistory } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import jsCookie from 'js-cookie'


const GoogleOAuthCallback = () => {

    const { signIn }  = useContext(AuthContext);
    const { push }  = useHistory();


    useEffect(() => {
        let mounted = true;
        const URL = `http://localhost/api/authentication/callback/google${window.location.search}`;
        const getTokens = () => {
            axios.get(URL, { withCredentials: true })
            .then(({ data }) => {
                if (mounted) {
                    signIn(
                        data.access_token,  
                        data.authenticated_user
                    );
                }
            }).catch(() => push('/sign-in'));
        }

        getTokens();
        return () => mounted = false;
    }, []);

    return <LinearProgress variant="indeterminate"/>
}

const AppAuthenticator = () => {

    const [session, setSession] = useState(null);
    const [fetching, setFetching] = useState(true);
    
    useEffect(() => {
        const token = jsCookie.get('_ifhelper_at');

        if (token) {
            const headers = { Authorization: `Bearer ${token}` };
            const config = { headers, withCredentials: true };
            const URL = `${process.env.REACT_APP_API_URL}/authentication/authorize`;

            axios.get(URL, config)
                .then(({ data }) => {
                    const { authenticated_user, access_token } = data;
                    setSession(authenticated_user);
                    setFetching(false);
                })
                .catch(({ response }) => {
                    jsCookie.remove('_ifhelper_at');
                    setFetching(false)
                });

        } else {
            setFetching(false);
        }

    }, []);

    const contextVal = useMemo(() => ({
        session,
        signIn: (accessToken, userData) => {
            const expires = new Date(Date.now() + (60 * 60 * 24 * 14 * 1000));
            jsCookie.set('_ifhelper_at', accessToken, { path: '/', expires });
            setSession(userData);
        },
        signOut: () => {
            const token = jsCookie.get('_ifhelper_at');
            const headers = { Authorization: `Bearer ${token}` };
            const config = { headers, withCredentials: true };

            console.log(config);
            jsCookie.remove('_ifhelper_at');
            setSession(null);
            
            axios.post(process.env.REACT_APP_API_URL + '/authentication/sign-out', {}, config)
                .then(({ data }) => {
                    console.log(data);
                })
                .catch((error) => {
                    console.log(error);
                })
        },
    }), [ session ]);

    if (fetching) return <CircularProgress variant="indeterminate"/>

    return (
        <AuthContext.Provider value={contextVal}>
            {session ? (
                
                <Switch>
                    <RouteWithLayout
                        component={DashboardView}
                        exact
                        layout={MainLayout}
                        path="/dashboard"
                    />
                    <RouteWithLayout
                        component={UserListView}
                        exact
                        layout={MainLayout}
                        path="/users"
                    />
                    <RouteWithLayout
                        component={ProductListView}
                        exact
                        layout={MainLayout}
                        path="/products"
                    />
                    <RouteWithLayout
                        component={TypographyView}
                        exact
                        layout={MainLayout}
                        path="/typography"
                    />
                    <RouteWithLayout
                        component={IconsView}
                        exact
                        layout={MainLayout}
                        path="/icons"
                    />
                    <RouteWithLayout
                        component={AccountView}
                        exact
                        layout={MainLayout}
                        path="/account"
                    />
                    <RouteWithLayout
                        component={SettingsView}
                        exact
                        layout={MainLayout}
                        path="/settings"
                    />
                    <RouteWithLayout
                        component={NotFoundView}
                        exact
                        layout={MinimalLayout}
                        path="/not-found"
                    /> 
                    <Redirect to="/dashboard" />
                </Switch>
            ) : (
                <Switch>
                    <RouteWithLayout
                        component={SignInView}
                        exact
                        layout={MinimalLayout}
                        path="/sign-in"
                    />
                    <RouteWithLayout
                        component={SignUpView}
                        exact
                        layout={MinimalLayout}
                        path="/sign-up"
                    /> 
                    <RouteWithLayout
                        component={GoogleOAuthCallback}
                        exact
                        layout={MinimalLayout}
                        path="/callback/auth/google"
                    /> 
                    <Redirect to="/sign-in" />
                </Switch>
            )}
        </AuthContext.Provider>
    )
}


export default AppAuthenticator