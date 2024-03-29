package com.cnpanoramio.dao.impl.hibernate;

import java.util.List;
import java.util.Set;

import org.appfuse.dao.hibernate.GenericDaoHibernate;
import org.appfuse.model.User;
import org.hibernate.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.cnpanoramio.dao.UserSettingsDao;
import com.cnpanoramio.domain.Tag;
import com.cnpanoramio.domain.UserSettings;

@Repository("userSettingsDao")
public class UserSettingsDaoImpl extends GenericDaoHibernate<UserSettings, Long> implements UserSettingsDao {

	public UserSettingsDaoImpl() {
		super(UserSettings.class);
		// TODO Auto-generated constructor stub
	}

	@Override
	public UserSettings getByUserName(String userName) {
		Query photoListQuery = getSession().createQuery("select us from UserSettings as us left join us.user as u where u.username = :username");
		
		photoListQuery.setParameter("username", userName);
		return (UserSettings) photoListQuery.uniqueResult();
	}

	@Override
	public List<String> getUserTags(User user) {
		Query query = getSession()
				.createQuery("select distinct t.tag from Photo as p inner join p.tags as t where p.owner = :user");
		query.setParameter("user", user);
		List res = query.list();
		return res;
	}

	@Override
	public Tag getTag(String tag) {
		Query query = getSession()
				.createQuery("from Tag where tag = :tag");
		query.setParameter("tag", tag);
		return (Tag) query.uniqueResult();
	}

	@Override
	public Set<Tag> createTag(UserSettings user, String tag) {
		Tag t = getTag(tag);
		if(null == t) {
			t = new Tag(tag);
		}
		user.getTags().add(t);
		return user.getTags();
	}

	@Override
	public Tag getOrCreateUserTag(UserSettings user, String tag) {
		
		Query query = getSession()
				.createQuery("select distinct t from Tag as t inner join t.users as u where u = :user and t.tag = :tag");
		query.setParameter("user", user);
		query.setParameter("tag", tag);
		Tag t = (Tag) query.uniqueResult();
		if(null == t) {
			t = getTag(tag);
			if(null == t) {
				t = new Tag(tag);
				t.getUsers().add(user);
			}
			user.getTags().add(t);
		}
		return t;
	}
}
