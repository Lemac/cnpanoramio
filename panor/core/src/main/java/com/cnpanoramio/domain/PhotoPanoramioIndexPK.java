package com.cnpanoramio.domain;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class PhotoPanoramioIndexPK implements Serializable {
	
	public PhotoPanoramioIndexPK() {
		super();
	}
	
	public PhotoPanoramioIndexPK(int level, Double south, Double west) {
		super();
		this.level = level;
		this.south = south;
		this.west = west;
	}
		
	/**
	 * 
	 */
	private static final long serialVersionUID = -3374178340582472091L;

	@Column(name="level", length = 2)
	private int level;
	
	private Double south;
	private Double west;
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
            return true;
        if (!(obj instanceof PhotoPanoramioIndexPK))
            return false;
        PhotoPanoramioIndexPK pk = (PhotoPanoramioIndexPK) obj;
        return pk.getLevel() == this.level && 
        		pk.getSouth() == this.south &&
        		pk.getWest() == this.west;
	}
	
	@Override
	public int hashCode() {
		return super.hashCode();
	}
	
	public int getLevel() {
		return level;
	}
	public void setLevel(int level) {
		this.level = level;
	}
	public Double getSouth() {
		return south;
	}
	public void setSouth(Double south) {
		this.south = south;
	}
	public Double getWest() {
		return west;
	}
	public void setWest(Double west) {
		this.west = west;
	}	
	
}