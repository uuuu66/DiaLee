import axios, { AxiosError,AxiosResponse } from "axios"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil";
import {api} from "../constants"
import useCookie from "../hooks/useCookie";
import {oneMonth} from '../js/setDate'
import Router from "next/router"
export interface ISendAccountData{
    [index:string]:string;
    "voyager_name": string,
    "email": string,
    "password1": string,
    "password2": string
}
export interface ICheckData{
    "is_valid":Boolean,
    "message":string,
}
export interface ILoginData{
    "status":boolean,
    "access_token":string|null,
    "refresh_token":string|null,
    "message":string,
}

const {getCookie,removeCookie,setCookie}=useCookie()
export const sendSignUp=async (data:ISendAccountData)=>{// 회원가입 
    try{
        await axios.post(`${api}/accounts/`,data);
        const goodResponse:ICheckData={
            is_valid:true,
            message:"회원가입이 완료되었습니다~! 아래 버튼을 눌러서 로그인을 해주세요.",
        }
        return {data:goodResponse}
   }catch(error){
   
    if(!(error as AxiosError).response){
        const NoResponse:ICheckData={
            is_valid:false,
            message:"인터넷 문제나 서버문제가 발생하였습니다."
        }
        return {data:NoResponse}
    }
        const ServerError:ICheckData={
            is_valid:false,
            message:"서버 오류가 발생하였습니다."
        }
        ServerError.message=`${ServerError.message}::${(error as AxiosError).response?.status}`
        return {data:ServerError};
    
    }
}
export const sendCheckEmail=async(email:string)=>{//이메일체크
        const data={
            "email":email
        }
     try{
       await axios.post(`${api}/accounts/email-check/`,data);
        const goodResponse:ICheckData={
                 is_valid:true,
                 message:"",
        }
        return {data:goodResponse}
    }catch(error){
        console.log(error);
        if(!(error as AxiosError).response){//인터넷 문제 아예 요청이 안보내짐 
            const NoResponse:ICheckData={
                is_valid:false,
                message:"인터넷 문제나 서버문제가 발생하였습니다."
            }
            return {data:NoResponse}
        }
        if ((error as AxiosError).response?.status === 409) {//중복 
            
            const Conflict:ICheckData={
                is_valid:false,
                message:"이메일이 중복입니다."
            }
            return {data:Conflict};
        }
        else{
            const ServerError:ICheckData={//그 외 알 수 없는 이유 
                is_valid:false,
                message:"서버 오류가 발생하였습니다."
            }
            ServerError.message=`${ServerError.message}::${(error as AxiosError).response?.status}`
            return {data:ServerError};
        }
        
     }
}
export const sendLogin=async(email:string,pwd:string)=>{//로그인
    const data={
        email:email,
        password:pwd
    }
    try{
       
        removeCookie("refresh_token")
        const res:AxiosResponse<any>=await axios.post(`${api}/accounts/login/`,data);
        const goodResponse:ILoginData={
            status:true,
            access_token:res.data?.access_token,
            refresh_token:res.data?.refresh_token,
            message:"로그인이 성공하였습니다."
        }
        const auto=getCookie("auto_login_temp");
        axios.defaults.headers.common['Authorization'] = `Bearer ${goodResponse.access_token}`;
               
        if(auto==="true"){
                    const expires=oneMonth()
                  
                    setCookie("refresh_token",res.data.refresh_token||"no-token",{expires:expires}); 
                    setCookie("auto_login","true",{expires:expires});   
        }else{
                    
                    setCookie("refresh_token",res.data.refresh_token||"no-token",);
        }
        removeCookie("auto_login_temp")
        return {data:goodResponse};
    }catch(error){
 
        removeCookie("access_token");
        if(!(error as AxiosError).response){//인터넷 문제  요청이 안보내짐 
            const NoResponse:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"인터넷 문제나 서버문제가 발생하였습니다."
            }
            return {data:NoResponse}
        }
        if((error as AxiosError).response?.status===400){//필드가 비어있음.
            const ServerError:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"이메일이나 비밀번호가 맞지 않습니다.::400"
            }
            return {data:ServerError};
        }
            const ServerError:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"서버 오류가 발생하였습니다."
            }
            ServerError.message=`${ServerError.message}::${(error as AxiosError).response?.status}`
            return {data:ServerError};
    }

}
export const sendLogout=async()=>{
    try{
        await axios.post(`${api}/accounts/logout/`);
        const goodResponse:ILoginData={
            status:true,
            access_token:null,
            refresh_token:null,
            message:"로그아웃에 성공하였습니다. "
        }
        removeCookie("access_token");
        removeCookie("refresh_token");
        removeCookie("auto_login")
        return {data:goodResponse}
    }catch(error){
        removeCookie("access_token");
        removeCookie("refresh_token");
        removeCookie("auto_login")
            if(!(error as AxiosError).response){//인터넷 문제  요청이 안보내짐 
                const NoResponse:ILoginData={
                    status:true,
                    access_token:null,
                    refresh_token:null,
                    message:"인터넷 문제나 서버문제가 발생하였습니다."
                }
                return {data:NoResponse}
            }
            if((error as AxiosError).response?.status===400){//필드가 비어있음.
                const ServerError:ILoginData={
                    status:true,
                    access_token:null,
                    refresh_token:null,
                    message:"잘못된 요청입니다. 다시 시도해주세요.::400"
                }
                return {data:ServerError};
            }
            const ServerError:ILoginData={
                    status:true,
                    access_token:null,
                    refresh_token:null,
                    message:"서버 오류가 발생하였습니다."
                }
            ServerError.message=`${ServerError.message}::${(error as AxiosError).response?.status}`
            return {data:ServerError};
    }
    
}
export const sendRefresh=async(refresh:string)=>{
    try{
        removeCookie("refresh_token");
        const res:AxiosResponse<any>=await axios.post(`${api}/accounts/token/refresh/`,{refresh:refresh});
        
        const goodResponse:ILoginData={
            status:true,
            access_token:res.data?.access,
            refresh_token:refresh,
            message:"성공."
        }   
        axios.defaults.headers.common['Authorization'] = `Bearer ${goodResponse.access_token}`;
        const auto=getCookie("auto_login");
        if(auto==="true"){
                    const expires=oneMonth()
                  
                    setCookie("refresh_token",res.data.refresh_token||"no-token",{expires:expires}); 
                    setCookie("auto_login","true",{expires:expires});   
        }else{
                removeCookie("auto_login")
                    setCookie("refresh_token",res.data.refresh_token||"no-token",);
        }
        removeCookie("auto_login_temp")
        return {data:goodResponse};
    }catch(error){
        removeCookie("refresh_token");
        removeCookie("auto_login");
        if(!(error as AxiosError).response){//인터넷 문제  요청이 안보내짐 
            const NoResponse:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"인터넷 문제나 서버문제가 발생하였습니다."
            }
            return {data:NoResponse}
        }
        if((error as AxiosError).response?.status===400){//필드가 비어있음.
            const ServerError:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"이메일이나 비밀번호가 맞지 않습니다.::400"
            }
            return {data:ServerError};
        }
            const ServerError:ILoginData={
                status:false,
                access_token:null,
                refresh_token:null,
                message:"서버 오류가 발생하였습니다."
            }
            ServerError.message=`${ServerError.message}::${(error as AxiosError).response?.status}`
            return {data:ServerError};
    }
}