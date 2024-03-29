package com.cnpanoramio.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Criteria;
import org.hibernate.Query;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cnpanoramio.MapVendor;
import com.cnpanoramio.dao.PhotoDao;
import com.cnpanoramio.dao.PhotoPanoramioDao;
import com.cnpanoramio.dao.PhotoPanoramioIndexDao;
import com.cnpanoramio.dao.UserSettingsDao;
import com.cnpanoramio.domain.Photo;
import com.cnpanoramio.domain.PhotoPanoramioIndex;
import com.cnpanoramio.domain.PhotoPanoramioIndexPK;
import com.cnpanoramio.domain.Point;
import com.cnpanoramio.domain.UserSettings;
import com.cnpanoramio.json.PanoramioResponse.PhotoPanoramio;
import com.cnpanoramio.service.FileService;
import com.cnpanoramio.service.PhotoPanoramioIndexService;

@Service("panoramioIndexService")
@Transactional
public class PhotoPanoramioIndexServiceImpl implements
		PhotoPanoramioIndexService {

	private transient final Log log = LogFactory.getLog(getClass());

	private Double conMeasure = 40D;

	@Autowired
	private PhotoPanoramioIndexDao panorIndexDao;

	@Autowired
	private PhotoPanoramioDao photoPanoramioDao;
	@Autowired
	private PhotoDao photoDao;
	@Autowired
	private UserSettingsDao userDao;

	@Autowired
	private PhotoPanoramioIndexDao photoPanoramioIndexDao;

	@Override
	public boolean updatePanoramioIndex() {
		 return panorIndexDao.updatePhotoPanoramioIndex();
//		return updatePhotoIndex();
	}

	@Override
	public List<PhotoPanoramio> getPanoramio(Double swLat, Double swLng,
			Double neLat, Double neLng, int level, MapVendor vendor, int width,
			int height) {
		List<Photo> photos = panorIndexDao.getPhotoPanoramio(swLat, swLng,
				neLat, neLng, level, vendor, width, height);
		// log.debug("get photo size: " + photos.size());
		List<PhotoPanoramio> pps = fillPhotoPanoramioList(photos);
		// log.debug("get pp size: " + pps.size());
		return pps;
	}

	@Override
	public List<PhotoPanoramio> getUserPhotoPanoramio(Double swLat,
			Double swLng, Double neLat, Double neLng, int level,
			MapVendor vendor, int width, int height, Long userId) {
		return fillPhotoPanoramioList(panorIndexDao.getUserPhotoPanoramio(
				swLat, swLng, neLat, neLng, level, vendor, width, height,
				userId, false));
	}

	@Override
	public List<PhotoPanoramio> getUserFavPanoramio(Double swLat, Double swLng,
			Double neLat, Double neLng, int level, MapVendor vendor, int width,
			int height, Long userId) {
		return fillPhotoPanoramioList(panorIndexDao.getUserPhotoPanoramio(
				swLat, swLng, neLat, neLng, level, vendor, width, height,
				userId, true));
	}

	@Override
	public boolean updatePhotoLatestIndex() {
		return panorIndexDao.updatePhotoLatestIndex();
	}

	@Override
	public List<PhotoPanoramio> getLatestPanoramio(Double swLat, Double swLng,
			Double neLat, Double neLng, int level, MapVendor vendor, int width,
			int height) {
		log.debug("getLatestPanoramio service");
		return fillPhotoPanoramioList(panorIndexDao.getLatestPanoramio(swLat,
				swLng, neLat, neLng, level, vendor, width, height));
	}

	private List<PhotoPanoramio> fillPhotoPanoramioList(List<Photo> photos) {
		List<PhotoPanoramio> pps = new ArrayList<PhotoPanoramio>();
		PhotoPanoramio pp;
		for (Photo photo : photos) {
			pp = fillPhotoPanoramio(photo);
			if (null != pp) {
				pps.add(pp);
			}
		}
		return pps;
	}

	private PhotoPanoramio fillPhotoPanoramio(Photo photo) {
		PhotoPanoramio pp = new PhotoPanoramio();
		pp.setPhotoId(photo.getId());
		Point point = photo.getGpsPoint();
		if (null != point) {
			pp.setLat(point.getLat());
			pp.setLng(point.getLng());
			pp.setAlt(point.getAlt());
			pp.setAddress(point.getAddress());
		} else {
			return null;
		}
		pp.setRating(photo.getRating());
		pp.setTitle(photo.getTitle());
		pp.setCreateDate(photo.getCreateDate());
		pp.setUserId(photo.getOwner().getId());
		UserSettings user = userDao.get(pp.getUserId());
		pp.setUsername(user.getName());
		
		pp.setOssKey(photo.getId() + "." + photo.getFileType());

		return pp;
	}

	public boolean updatePhotoIndex() {
		int lLevel = 0;
		double lMeasure = 0;
		Double lSouth, lWest;

		panorIndexDao.clearPhotoIndex();

		/** 更新最底层photo */
		lLevel = 19;
		lMeasure = conMeasure / Math.pow(2D, lLevel);
		lSouth = -90D;
		lWest = -180D;
		while (lWest < 180D) {
			log.debug("lLevel 19 lWest = " + lWest);
			while (lSouth < 90D) {
				log.debug("lLevel 19 lSouth = " + lSouth);
				updatePhotoRegion(lLevel, lSouth, lWest, lMeasure);
				lSouth += lMeasure;
			}
			lWest += lMeasure;
		}

		/** 根据索引表逐级往上更新 */
		lLevel -= 1;
		while (lLevel > 2) {
			log.debug("lLevel = " + lLevel);
			lMeasure = conMeasure / Math.pow(2D, lLevel);
			lSouth = -90D;
			lWest = -180D;
			while (lWest < 180D) {
				log.debug("lWest = " + lWest);
				while (lSouth < 90D) {
					log.debug("lSouth = " + lSouth);
					updateIndexRegion(lLevel, lSouth, lWest, lMeasure);
					lSouth += lMeasure;
				}
				lWest += lMeasure;
			}
			lLevel -= 1;
		}

		return true;
	}

	private void updateIndexRegion(int level, Double west, Double south,
			Double measure) {

		List<PhotoPanoramioIndex> ppiList = panorIndexDao
				.getPhotoPanoramioIndexList(level, west, south, measure);
		if (ppiList.size() > 0) {
			PhotoPanoramioIndex maxPPI = ppiList.get(0);
			PhotoPanoramioIndex[] ppis = new PhotoPanoramioIndex[] {};
			PhotoPanoramioIndex photoIndex = new PhotoPanoramioIndex();
			photoIndex.setPk(new PhotoPanoramioIndexPK(level, maxPPI.getPk()
					.getSouth(), maxPPI.getPk().getWest()));
			photoIndex.setPhotoRating(maxPPI.getPhotoRating());
			photoIndex.setBigPhoto(true);
			photoIndex = photoPanoramioIndexDao.save(photoIndex);
			ppis[ppis.length] = photoIndex;

			boolean allow = true;
			for (PhotoPanoramioIndex ppi : ppiList) {
				allow = true;
				for (PhotoPanoramioIndex ppi2 : ppis) {
					if (Math.abs(ppi.getPk().getSouth()
							- ppi2.getPk().getSouth()) < measure / 3
							&& Math.abs(ppi.getPk().getWest()
									- ppi2.getPk().getWest()) < measure / 3) {
						allow = false;
						break;
					}
				}
				if (allow) {
					PhotoPanoramioIndex ppi2 = new PhotoPanoramioIndex();
					ppi2.setPk(new PhotoPanoramioIndexPK(level, ppi.getPk()
							.getSouth(), ppi.getPk().getWest()));
					ppi2.setPhotoRating(ppi.getPhotoRating());
					ppi2 = photoPanoramioIndexDao.save(ppi2);
					ppis[ppis.length] = ppi2;
				}
			}
		}
	}

	private void updatePhotoRegion(int level, Double west, Double south,
			Double measure) {
		List<Photo> photos = panorIndexDao.getPhotoList(level, west, south,
				measure);
		if (photos.size() > 0) {

			Photo maxPhoto = null;
			for (Photo photo : photos) {
				int rating = photo.getComments().size()
						+ photo.getLikes().size() + photo.getViews().size()
						+ photo.getFavorites().size();
				photo.setRating(rating);
				if (null == maxPhoto || maxPhoto.getRating() < rating) {
					maxPhoto = photo;
				}
			}
			Photo[] ps = new Photo[] {};
			photos.toArray(ps);
			Arrays.sort(ps);

			PhotoPanoramioIndex[] ppis = new PhotoPanoramioIndex[] {};
			PhotoPanoramioIndex photoIndex = new PhotoPanoramioIndex();
			photoIndex.setPk(new PhotoPanoramioIndexPK(level, maxPhoto
					.getGpsPoint().getLat(), maxPhoto.getGpsPoint().getLng()));
			photoIndex.setPhotoRating(maxPhoto.getRating());
			photoIndex.setBigPhoto(true);
			photoIndex = photoPanoramioIndexDao.save(photoIndex);
			ppis[ppis.length] = photoIndex;

			boolean allow = true;
			for (Photo photo : ps) {
				allow = true;
				for (PhotoPanoramioIndex ppi : ppis) {
					if (Math.abs(photo.getGpsPoint().getLat()
							- ppi.getPk().getSouth()) < measure / 3
							&& Math.abs(photo.getGpsPoint().getLng()
									- ppi.getPk().getWest()) < measure / 3) {
						allow = false;
						break;
					}
				}
				if (allow) {
					PhotoPanoramioIndex ppi = new PhotoPanoramioIndex();
					ppi.setPk(new PhotoPanoramioIndexPK(level, photo
							.getGpsPoint().getLat(), photo.getGpsPoint()
							.getLng()));
					ppi.setPhotoRating(photo.getRating());
					ppi = photoPanoramioIndexDao.save(ppi);
					ppis[ppis.length] = ppi;
				}
			}
		}
	}
}
