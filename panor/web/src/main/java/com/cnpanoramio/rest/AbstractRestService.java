package com.cnpanoramio.rest;

import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.cnpanoramio.json.ExceptionResponse;
import com.cnpanoramio.json.UserResponse;

public abstract class AbstractRestService {

	private transient final Log log = LogFactory.getLog(getClass());
	
	protected ExceptionResponse responseFactory() {
		ExceptionResponse reponse = new ExceptionResponse();
		return reponse;
	}
	
	@ExceptionHandler(AccessDeniedException.class)
	@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
	@ResponseBody
	public ExceptionResponse handleAccessDeniedException(AccessDeniedException ex) {
		ExceptionResponse reponse = responseFactory();
		reponse.setStatus(UserResponse.Status.NO_AUTHORIZE.name());
		reponse.setInfo(ex.getMessage());
		return reponse;
	}
	
	@ExceptionHandler(UsernameNotFoundException.class)
	@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
	@ResponseBody
	public ExceptionResponse handleUsernameNotFoundException(UsernameNotFoundException ex) {
		ExceptionResponse reponse = responseFactory();
		reponse.setStatus(UserResponse.Status.ACCESS_DENIED.name());
		reponse.setInfo(ex.getMessage());
		return reponse;
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value = HttpStatus.SERVICE_UNAVAILABLE)
	@ResponseBody
	public ExceptionResponse handleException(Exception ex) {
		log.error("Ocurr an error ", ex);
		ExceptionResponse reponse = responseFactory();
		reponse.setInfo(ex.getMessage());
		if(ex instanceof NumberFormatException) {
			reponse.setStatus(UserResponse.Status.ID_FORMAT_ERROR.name());
		}else if (ex instanceof UnsupportedEncodingException) {
			reponse.setStatus(UserResponse.Status.ID_FORMAT_ERROR.name());
		}else if (ex instanceof UsernameNotFoundException) {
			reponse.setStatus(UserResponse.Status.NO_AUTHORIZE.name());
		}else if (ex instanceof DataAccessException) {
			reponse.setStatus(UserResponse.Status.NO_ENTITY.name());
		}else if (ex instanceof AccessDeniedException) {
			reponse.setStatus(UserResponse.Status.ACCESS_DENIED.name());
		}else if (ex instanceof HttpMediaTypeNotSupportedException) {
			reponse.setStatus(UserResponse.Status.EXCEPTION.name());
		}else {
			reponse.setStatus(UserResponse.Status.EXCEPTION.name());
		}
		
		return reponse;
	}
	
}
