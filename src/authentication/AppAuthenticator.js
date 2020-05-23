import React, { useState, useEffect, useMemo } from 'react'
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

const AppAuthenticator = () => {

    const [session, setSession] = useState(null);
    const [fetching, setFetching] = useState(true);
    
    const [cookies, setCookie, removeCookie] = useCookies();


    useEffect(() => {

        if (cookies._ifhelper_at) {
            const headers = { Authorization: `Bearer ${cookies._ifhelper_at}`}
            axios.get(process.env.REACT_APP_API_URL + '/authentication/authorize', { headers })
                .then(({ data: { authenticated_user} }) => {
                    setSession(authenticated_user)
                    setFetching(false)
                })
                .catch(({ response }) => {
                    console.log(response)
                    setFetching(false)
                })
        } else {
            setFetching(false);
        }

        console.log();

    }, [])


    const contextVal = useMemo(() => ({
        session,
        signIn: (token, sessionData) => {
            setCookie('_ifhelper_at', token, { sameSite: true })
            setSession(sessionData)
        },
        signOut: () => {
            const headers = { Authorization: `Bearer ${cookies._ifhelper_at}`}
            axios.post(process.env.REACT_APP_API_URL + '/authentication/sign-out', {}, { headers })
                .then(() => {
                    removeCookie('_ifhelper_at')
                    setSession(null)
                })
                .catch(({ response }) => {
                    console.log(response)
                }).finally(() => setSession(null))
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
                    <Redirect to="/sign-in" />
                </Switch>
            )}
        </AuthContext.Provider>
    )
}


export default AppAuthenticator