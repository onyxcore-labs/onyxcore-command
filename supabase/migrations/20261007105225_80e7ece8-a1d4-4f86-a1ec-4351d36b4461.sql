CREATE TABLE public.founder_status (handle text PRIMARY KEY, full_name text NOT NULL, role text NOT NULL, is_online boolean NOT NULL DEFAULT false, current_task text NOT NULL DEFAULT '', blocker text, progress_pct int NOT NULL DEFAULT 0, last_active timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.squad_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_handle text NOT NULL, sender_name text NOT NULL, channel text NOT NULL DEFAULT 'all-hands', content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.hardware_inventory (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), part_name text NOT NULL, category text NOT NULL, quantity_available int NOT NULL DEFAULT 0, specs text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'In Stock', assigned_to text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.project_ideas (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text NOT NULL DEFAULT '', source_url text NOT NULL DEFAULT '', submitted_by text NOT NULL, verdict text NOT NULL DEFAULT 'Under Discussion', upvotes int NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_status, public.squad_messages, public.hardware_inventory, public.project_ideas TO anon, authenticated;
GRANT ALL ON public.founder_status, public.squad_messages, public.hardware_inventory, public.project_ideas TO service_role;

ALTER TABLE public.founder_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team read" ON public.founder_status FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team update" ON public.founder_status FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team read" ON public.squad_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team insert" ON public.squad_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "team all" ON public.hardware_inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team all" ON public.project_ideas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.founder_status REPLICA IDENTITY FULL;
ALTER TABLE public.squad_messages REPLICA IDENTITY FULL;
ALTER TABLE public.hardware_inventory REPLICA IDENTITY FULL;
ALTER TABLE public.project_ideas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.founder_status, public.squad_messages, public.hardware_inventory, public.project_ideas;

INSERT INTO public.founder_status (handle, full_name, role, current_task, blocker, progress_pct) VALUES
('ghambuna','Maximilian Ghambuna','Lead & Firmware Systems','ESP32 telemetry firmware v0.4',NULL,62),
('shamba','Brian Shamba','UI & Systems Architecture','Command Center dashboard shell',NULL,48),
('maganga','Aidan Maganga','Client Operations & QA','Pilot client onboarding checklist','Waiting on field test data',30),
('mchele','Blessing Mchele','Backend & Data Pipelines','Telemetry ingest pipeline','Waiting on API schema',55);

INSERT INTO public.hardware_inventory (part_name, category, quantity_available, specs, status, assigned_to) VALUES
('ESP32 DevKit v1','Microcontroller',8,'Dual-core 240MHz, Wi-Fi + BLE, 4MB flash','In Stock',NULL),
('DS18B20 Temp Sensors','Sensor',20,'1-Wire, -55 to +125°C, ±0.5°C','In Stock',NULL),
('Quectel SIM7080G Cellular Module','Radio / Wireless',2,'LTE Cat-M / NB-IoT, GNSS','Assigned','ghambuna'),
('TP4056 LiPo Chargers','Power',12,'1A single-cell Li-ion charger, USB-C','In Stock',NULL),
('SSD1306 0.96" OLEDs','Display & Interface',0,'128x64 I2C monochrome','Depleted',NULL);

INSERT INTO public.project_ideas (title, description, source_url, submitted_by, verdict, upvotes) VALUES
('Cold-chain telemetry pilot','Temperature logging for vaccine fridges at rural clinics using DS18B20 + NB-IoT.','https://github.com/espressif/esp-idf','maganga','Under Discussion',3);