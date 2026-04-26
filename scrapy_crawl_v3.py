"""
JustPerfumes standalone Scrapy spider.
Run: scrapy runspider scrapy_crawl.py -s IMAGES_STORE=/path/to/images -s LOG_FILE=/tmp/scrapy.log
"""

import os
import csv
import json
from urllib.parse import urljoin, urlparse

import scrapy
from scrapy.pipelines.images import ImagesPipeline
from scrapy.http import Request
from itemadapter import ItemAdapter
import psycopg2


# ---------------------------------------------------------------------------
# Item
# ---------------------------------------------------------------------------
class PerfumeItem(scrapy.Item):
    product_id = scrapy.Field()
    product_name = scrapy.Field()
    source_url = scrapy.Field()
    description = scrapy.Field()
    image_url = scrapy.Field()
    image_path = scrapy.Field()
    status = scrapy.Field()


# ---------------------------------------------------------------------------
# DB Pipeline
# ---------------------------------------------------------------------------
class PerfumeDBPipeline:
    def __init__(self):
        self.conn = psycopg2.connect(
            host='127.0.0.1', port=5432, database='justperfumes',
            user='justperfumes_user', password='JustPerfumes2025!'
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()
        self.updated = 0

    @classmethod
    def from_crawler(cls, crawler):
        return cls()

    def close_spider(self, spider):
        spider.logger.info(f"DB Pipeline: {self.updated} products updated in this run")

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        pid = adapter.get('product_id')
        desc = adapter.get('description', '') or ''
        img_path = adapter.get('image_path') or ''

        if adapter.get('status') == 'error':
            return item

        updates = []
        params = []
        if desc and len(desc) > 10:
            updates.append('description = %s')
            params.append(desc[:1000])
        if img_path:
            local_path = f'/scrapy_project/images/{img_path}'
            updates.append('"imageUrl" = %s')
            params.append(local_path)

        if updates and pid:
            params.append(pid)
            try:
                sql = f'UPDATE "Product" SET {", ".join(updates)} WHERE id = %s'
                self.cur.execute(sql, params)
                self.updated += 1
                ok_d = bool(desc and len(desc) > 10)
                ok_i = bool(img_path)
                spider.logger.info(
                    f"[DB] {adapter.get('product_name', '')[:45]} | desc={ok_d} img={ok_i}"
                )
            except Exception as e:
                spider.logger.error(f"[ERR] DB update failed for {pid}: {e}")
        return item


# ---------------------------------------------------------------------------
# Image Pipeline
# ---------------------------------------------------------------------------
class PerfumeImagePipeline(ImagesPipeline):
    def get_media_requests(self, item, info):
        img_url = item.get('image_url')
        if img_url:
            # Store product_id on item so file_path can access it
            item['image_filename'] = f"{item.get('product_id', 'unknown')}"
            yield Request(img_url)

    def file_path(self, request, response=None, info=None):
        # Get product_id from the item stored by get_media_requests
        item = info and info.get('item')
        pid = 'unknown'
        if item:
            pid = item.get('product_id', 'unknown')
        url = request.url
        ext = os.path.splitext(urlparse(url).path)[1]
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
            ext = '.jpg'
        return f'{pid}{ext}'

    def item_completed(self, results, item, info):
        ok = any(x[0] for x in results)
        path = None
        if ok:
            for (check, res) in results:
                if check:
                    path = res['path']
        item['image_path'] = path or ''
        return item


# ---------------------------------------------------------------------------
# Spider
# ---------------------------------------------------------------------------
class PerfumeSpider(scrapy.Spider):
    name = 'perfume_crawl'
    allowed_domains = []

    custom_settings = {
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'CONCURRENT_REQUESTS_PER_DOMAIN': 8,
        'DOWNLOAD_DELAY': 0.3,
        'AUTOTHROTTLE_ENABLED': True,
        'AUTOTHROTTLE_START_DELAY': 0.5,
        'AUTOTHROTTLE_TARGET_CONCURRENCY': 6.0,
        'RETRY_ENABLED': True,
        'RETRY_TIMES': 2,
        'RETRY_HTTP_CODES': [500, 502, 503, 504, 408, 429],
        'ITEM_PIPELINES': {
            PerfumeImagePipeline: 1,
            PerfumeDBPipeline: 2,
        },
        'LOG_LEVEL': 'INFO',
        'CLOSESPIDER_ITEMCOUNT': 500,
    }

    def __init__(self, urls_file='/tmp/urls.csv', *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = []
        self.product_map = {}

        if os.path.exists(urls_file):
            with open(urls_file, 'r') as f:
                reader = csv.reader(f)
                next(reader)  # skip header
                for row in reader:
                    if len(row) >= 3:
                        pid, pname, purl = row[0], row[1], row[2].strip('"')
                        self.start_urls.append(purl)
                        self.product_map[purl] = (pid, pname)
            self.logger.info(f"Loaded {len(self.start_urls)} URLs from {urls_file}")
        else:
            self.logger.warning(f"URLs file not found: {urls_file}")

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                callback=self.parse,
                errback=self.errback,
                headers={
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                }
            )

    def errback(self, failure):
        url = failure.request.url
        pid, pname = self.product_map.get(url, ('unknown', 'unknown'))
        item = PerfumeItem()
        item['product_id'] = pid
        item['product_name'] = pname
        item['source_url'] = url
        item['description'] = ''
        item['image_url'] = ''
        item['image_path'] = ''
        item['status'] = 'error'
        self.logger.warning(f"[FAIL] {pname[:50]} — {failure.value}")
        yield item

    def parse(self, response):
        url = response.url
        pid, pname = self.product_map.get(url, ('unknown', 'unknown'))
        item = PerfumeItem()
        item['product_id'] = pid
        item['product_name'] = pname
        item['source_url'] = url
        item['status'] = 'ok'
        description = ''
        image_url = ''

        # JSON-LD schema (most reliable)
        for json_str in response.css('script[type="application/ld+json"]::text').getall():
            try:
                data = json.loads(json_str)
                entries = data if isinstance(data, list) else [data]
                for entry in entries:
                    if entry.get('@type') in ('Product', 'IndividualProduct', 'product'):
                        description = entry.get('description', '')
                        img = entry.get('image', '')
                        if isinstance(img, list):
                            img = img[0] if img else ''
                        image_url = img
                        break
                if description and image_url:
                    break
            except Exception:
                pass

        # Meta fallback
        if not description:
            description = (
                response.css('meta[property="og:description"]::attr(content)').get('') or
                response.css('meta[name="description"]::attr(content)').get('') or ''
            )
        if not image_url:
            image_url = (
                response.css('meta[property="og:image"]::attr(content)').get('') or
                response.css('meta[name="twitter:image"]::attr(content)').get('') or ''
            )

        if image_url and not image_url.startswith('http'):
            image_url = urljoin(url, image_url)

        item['description'] = description.strip()[:1000] if description else ''
        item['image_url'] = image_url
        item['image_path'] = ''
        yield item
