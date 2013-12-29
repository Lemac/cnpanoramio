<%@ include file="/common/taglibs.jsp"%>
<%@ page language="java" pageEncoding="UTF-8"%>

<html lang="en">
<head>
<title><fmt:message key="upload.title" /></title>
<meta name="menu" content="AdminMenu" />
<!-- Force latest IE rendering engine or ChromeFrame if installed -->
<!--[if IE]>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<![endif]-->
<meta charset="UTF-8">
<title>Explore the world</title>
<meta name="description" content="Explore the world">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Custom styles for this template -->
    <link href="<c:url value="/styles/ExploreWorld.css"/>" rel="stylesheet">
    
</head>
<body>
    <script type="text/javascript" src="<c:url value="/scripts/fileupload/vendor/jquery.min.1.10.2.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/lib/plugins/jquery.rest.min.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/fileupload/blueimp/tmpl.min.js"/>"></script>
    <%-- <script type="text/javascript" src="<c:url value='/scripts/imgLiquid/imgLiquid.js'/>"></script> --%>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.comm.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.Panoramio.js"/>"></script>
<c:choose>
  <c:when test='${sessionScope.mapVendor eq "baidu"}'>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.baidu.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/js/cnmap.baidu.js"/>"></script>
    <script type="text/javascript"
            src="http://api.map.baidu.com/api?v=2.0&ak=41cd06c76f253eebc6f322c863d4baa1"></script>
  </c:when>
  <c:when test='${sessionScope.mapVendor eq "qq"}'>
    <script charset="utf-8" src="http://map.qq.com/api/js?v=2.0"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.qq.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/js/cnmap.qq.js"/>"></script>
  </c:when>
  <c:when test='${sessionScope.mapVendor eq "gaode"}'>
    <script src="http://webapi.amap.com/maps?v=1.2&key=53f7e239ddb8ea62ba552742a233ed1f" type="text/javascript"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.gaode.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/js/cnmap.gaode.js"/>"></script>
  </c:when>
  <c:when test='${sessionScope.mapVendor eq "mapbar"}'>
  
  </c:when>
  <c:otherwise>
    <script src="http://webapi.amap.com/maps?v=1.2&key=53f7e239ddb8ea62ba552742a233ed1f" type="text/javascript"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/panoramio/cnmap.gaode.js"/>"></script>
    <script type="text/javascript" src="<c:url value="/scripts/panor/js/cnmap.gaode.js"/>"></script>
  </c:otherwise>
</c:choose>

  <script type="text/javascript">
        $(document).ready(function () {
        	var map = $.cnmap.initMap("map-canvas", {
                toolbar: true,
                scrollzoom: true,
                overview: true,
                locatecity: true
            });
            setPanoramioLayer(map);

            function setPanoramioLayer(map) {
                var panoramioLayer = new $.cnmap.PanoramioLayer({suppressInfoWindows: true});
                panoramioLayer.setMap(map);

                if (tmpl) {
                    template_preview_thumb = tmpl("template-preview-thumb");
                }
                $(panoramioLayer).bind("data_changed", function(e, data) {
                    var tiems = [];
                    $.each(data, function(i, item) {
                        var imgId = "#r" + item.photoId;
                        var images = $("#preview").find(imgId);
                        if(!images.length) {
                            tiems.push(item);
                        }
                    })

                    $("#preview .preview_thumb_area").each(function(i, element) {
                        var exist;
                        var id = $(this).attr("id");
                        id = id.replace("p", "");
                        $.each(data, function(i, item) {
                            if(id == item.photoId) {
                                exist = true;
                            }
                        })
                        if(!exist) {
                            $(this).remove();
                        }
                    })
                    var result = template_preview_thumb({
                        items: tiems
                    });
                    $("#preview").append(result);
                })
            }
        })
    </script> 

<table class="front-root table table-striped">
    <tr>
        <td class="">
            <div id="map-canvas"></div>
        </td>
        <td id="thumbarea" class="" width="500px">
            <div id="thumbinnerarea">
                <ul id="tabs" class="nav nav-pills">
                    <li id="tab_li_1" class="active">
                        <a set="public" order="popularity" tab="1" kml_text="Google 地球中的热门照片"
                           kml_link="/kml/" href="/map/?set=public&amp;order=popularity">热门照片<span style="display:none" class="total_photos"> (2294)</span>
                            <img class="loading" src="img/loading-p.gif" alt="读取中" style="display: none;">
                        </a>
                    </li>
                    <li id="tab_li_2">
                        <a set="recent" order="popularity" tab="2" kml_text="Google 地球中的最新照片" kml_link="/kml/?recent" href="/map/?set=recent&amp;order=popularity">最新照片<span style="display:none" class="total_photos"></span>
                            <img class="loading hide" src="img/loading-p.gif" alt="读取中">
                        </a>
                    </li>
                    <li id="tab_li_7">
                        <a set="places" order="popularity" tab="7" kml_text="谷歌地球里这个地方在所有的照片。" kml_link="/kml/?place=place_id" href="/map/?set=places&amp;order=popularity">地点<span style="display:none" class="total_photos"></span>
                            <img class="loading hide" src="img/loading-p.gif" alt="读取中">
                        </a>
                    </li>
                    <li id="tab_li_8">
                        <a set="indoor" order="popularity" tab="8" kml_text="谷歌地球里的室内照片" kml_link="/kml/?indoor" href="/map/?set=indoor&amp;order=popularity">室内<span style="display:none" class="total_photos"></span>
                            <img class="loading hide" src="img/loading-p.gif" alt="读取中">
                        </a>
                    </li>
                    <li id="tab_li_4">
                        <a set="6324111" order="upload_date" tab="4" kml_text="您在Google 地球中的照片" kml_link="/kml/?user=6324111" href="/map/?set=6324111&amp;order=upload_date">您的照片<span style="display:none" class="total_photos"></span>
                            <img class="loading hide" src="img/loading-p.gif" alt="读取中">
                        </a>
                    </li>
                </ul>
                <div id="place_detail_area" style="display: none;">
                    <div id="cover_photo_box">
                        <a id="cover_photo_link" href="">
                            <img alt="Cover photo" id="cover_photo" src="/img/place_cover_photo.jpg">
                        </a>
                    </div>
                    <div id="place_description">
                        <span id="place_title" class="place_name"></span><br>
                        <a id="external-place-link" style="display: none;">
                            <span class="icon"></span>
                            Place details in Google Places.</a>
                        <a id="place-kml-link">See photos in Google Earth.</a>
                    </div>
                    <a id="all_places_link">« Back to all places</a>
                    <div id="place_photo_heading">
                        Photos of <span class="place_name"></span>
                    </div>
                </div>
                <div id="preview">

                </div>
                <ul class="pager">
                    <li class="previous"><a href="#">&larr; Older</a></li>
                    <li class="next"><a href="#">Newer &rarr;</a></li>
                </ul>
                <!--<div id="map_pages" class="pages">
                    <span class="inactive" style="display: none;" title="下一页" id="disabled_next_link">下一页 »</span>
                    <a title="下一页" style="display: inline;" id="enabled_next_link">下一页 »</a>
                    <a title="前一页" style="display: none;" id="enabled_previous_link">« 前一页</a>
                    <span class="inactive" style="display: inline;" title="前一页" id="disabled_previous_link">« 前一页</span>
                </div>-->

                <div style="clear:both"></div>
            </div>
        </td>
    </tr>
</table>

<script id="template-preview-thumb" type="text/x-tmpl">
    {% for (var i=0, item; item=o.items[i]; i++) { %}
    <div class="preview_thumb_area" id="p{%=item.photoId%}" style="height: 112px;">
        <a href="photo/{%=item.photoId%}">
            <img title=""
                 id="r{%=item.photoId%}"
                 src="services/api/photos/{%=item.photoId%}"
                 p_id="{%=item.photoId%}">
        </a>
    </div>
    {% } %}
</script>

</body>
</html>