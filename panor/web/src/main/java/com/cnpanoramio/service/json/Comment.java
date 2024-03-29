package com.cnpanoramio.service.json;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "Comment")
public class Comment {

	private Long photoid;
	private Long userid;
	private String comment;
	public Long getPhotoid() {
		return photoid;
	}
	public void setPhotoid(Long photoid) {
		this.photoid = photoid;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public Long getUserid() {
		return userid;
	}
	public void setUserid(Long userid) {
		this.userid = userid;
	}	
}
